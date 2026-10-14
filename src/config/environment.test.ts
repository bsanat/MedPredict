import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it.each([undefined, '', 'automatic'])('requires an explicit supported API mode (%s)', async (mode) => {
  vi.stubEnv('VITE_API_MODE', mode);
  const { configuredApi } = await import('./environment');
  expect(() => configuredApi()).toThrow();
});

it('requires an explicit demo scenario', async () => {
  vi.stubEnv('VITE_API_MODE', 'demo');
  vi.stubEnv('VITE_DEMO_SCENARIO', undefined);
  const { configuredApi } = await import('./environment');
  expect(() => configuredApi()).toThrow();
});

it.each(['0', '-1', 'abc', '1.5', '2147483648'])('rejects invalid API timeout %s', async (timeout) => {
  vi.stubEnv('VITE_API_MODE', 'real');
  vi.stubEnv('VITE_API_TIMEOUT_MS', timeout);
  const { configuredApi } = await import('./environment');
  expect(() => configuredApi()).toThrow();
});

it('rejects an unsupported URL scheme', async () => {
  vi.stubEnv('VITE_API_MODE', 'real');
  vi.stubEnv('VITE_API_BASE_URL', 'file:///tmp/api');
  const { configuredApi } = await import('./environment');
  expect(() => configuredApi()).toThrow();
});
