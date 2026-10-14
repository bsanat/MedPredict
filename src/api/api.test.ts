import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoModelInfo } from '../config/indicator';
import { createDemoApi } from './demo';
import { parseModelInfo, parsePrediction, parseValidationError } from './contract';
import { createHttpApi } from './http';

afterEach(() => vi.unstubAllGlobals());
const signal = () => new AbortController().signal;
const prediction = { predictedValue: 134.2, unit: 'мм рт. ст.', modelVersion: '1.0.0' };

describe('runtime contract', () => {
  it('accepts the documented POST and proposed GET response', () => {
    expect(parsePrediction(prediction)).toEqual(prediction);
    expect(parseModelInfo(demoModelInfo)).toEqual(demoModelInfo);
  });
  it.each([null, {}, { ...prediction, predictedValue: '134.2' }, { ...prediction, predictedValue: Infinity },
    { ...prediction, unit: '' }, { ...prediction, modelVersion: 1 }, { ...prediction, disclaimer: {} }])(
    'rejects malformed prediction response', (value) => expect(() => parsePrediction(value)).toThrow(),
  );
  it('rejects unit changes instead of displaying a mislabelled number', () => {
    expect(() => parsePrediction(prediction, 'different unit')).toThrow();
  });
  it.each([
    { ...demoModelInfo, decimalPlaces: -1 }, { ...demoModelInfo, decimalPlaces: 21 },
    { ...demoModelInfo, decimalPlaces: undefined }, { ...demoModelInfo, fields: [] },
    { ...demoModelInfo, fields: [...demoModelInfo.fields, demoModelInfo.fields[0]] },
    { ...demoModelInfo, fields: [{ key: '__proto__', label: 'bad', required: true, type: 'number', unit: 'u' }] },
    { ...demoModelInfo, fields: [{ key: 'x', label: 'bad', required: true, type: 'number', unit: 'u', min: 10, max: 1 }] },
    { ...demoModelInfo, fields: [{ key: 'x', label: 'bad', required: true, type: 'select', options: [{ value: 'a', label: 'A' }, { value: 'a', label: 'B' }] }] },
  ])('rejects incomplete or contradictory metadata', (value) => expect(() => parseModelInfo(value)).toThrow());
  it('preserves unknown field errors for the UI to report', () => {
    expect(parseValidationError({ error: 'VALIDATION_ERROR', fields: [{ field: 'unknown', message: 'Ошибка' }] }).fields[0]?.field).toBe('unknown');
    expect(() => parseValidationError({ error: 'VALIDATION_ERROR', fields: [] })).toThrow();
  });
});

describe('HTTP adapter', () => {
  it('posts JSON to the configured Spring Boot origin without storing values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(prediction));
    vi.stubGlobal('fetch', fetchMock);
    const api = createHttpApi('http://localhost:8080/', 1000);
    expect(await api.predict({ age: 0, bmi: 27.4 }, signal())).toEqual(prediction);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/v1/predictions', expect.objectContaining({
      method: 'POST', body: '{"age":0,"bmi":27.4}', cache: 'no-store', credentials: 'omit',
    }));
  });
  it('validates metadata received from GET', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(demoModelInfo)));
    expect(await createHttpApi('', 1000).getModelInfo(signal())).toEqual(demoModelInfo);
  });
  it.each([
    [400, { error: 'VALIDATION_ERROR', fields: [{ field: 'age', message: 'От 18 до 90' }] }, 'validation'],
    [400, { error: 'BAD_REQUEST' }, 'unexpected'],
    [503, {}, 'server'], [403, {}, 'badRequest'], [200, { value: 3 }, 'unexpected'],
  ])('handles status %s', async (status, response, kind) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(response, { status })));
    await expect(createHttpApi('', 1000).predict({}, signal())).rejects.toMatchObject({ kind });
  });
  it('handles non-JSON responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Error</html>')));
    await expect(createHttpApi('', 1000).predict({}, signal())).rejects.toMatchObject({ kind: 'unexpected' });
  });
  it('reports network failure without fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(createHttpApi('', 1000).predict({}, signal())).rejects.toMatchObject({ kind: 'network' });
  });
  it('distinguishes timeout from user cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
    })));
    await expect(createHttpApi('', 20).predict({}, signal())).rejects.toMatchObject({ kind: 'timeout' });
    const controller = new AbortController();
    const promise = createHttpApi('', 1000).predict({}, controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('demo adapter', () => {
  it('uses a fixed fixture regardless of input', async () => {
    const api = createDemoApi('success');
    const [a, b] = await Promise.all([api.predict({ age: 52 }, signal()), api.predict({ age: -1 }, signal())]);
    expect(a).toEqual(b);
    expect(a.predictedValue).toBe(134.2);
    expect(a.modelVersion).toBe('demo-example');
  });
  it.each([['validation', 'validation'], ['unavailable', 'server']] as const)(
    'reproduces %s', async (scenario, kind) => {
      await expect(createDemoApi(scenario).predict({}, signal())).rejects.toMatchObject({ kind });
    },
  );
  it('can be cancelled', async () => {
    const controller = new AbortController();
    const promise = createDemoApi('success').predict({}, controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
