import { describe, expect, it } from 'vitest';
import { demoModelInfo } from './config/indicator';
import { formatPrediction, parseNumber, validateInput } from './validation';
import type { FieldDefinition } from './types';

describe('numeric input', () => {
  it.each([
    ['0', 0], ['-5', -5], ['27,4', 27.4], ['27.4', 27.4], ['  5,9  ', 5.9],
    ['.5', .5], [',5', .5], ['+12', 12], ['12.', 12],
  ])('parses %s', (raw, expected) => expect(parseNumber(raw)).toBe(expected));
  it.each(['', ' ', 'abc', 'NaN', 'Infinity', '1e3', '1,2,3', '1.2.3', '12kg', '1 000', '--2', '9'.repeat(400)])(
    'rejects %s without coercing to zero', (raw) => expect(parseNumber(raw)).toBeUndefined(),
  );
});

describe('form validation', () => {
  const values = { age: '52', sex: 'male', bmi: '27,4', totalCholesterol: '5.6', glucose: '5,9' };
  it('translates the report example into the exact POST payload', () => {
    expect(validateInput(values, demoModelInfo.fields)).toEqual({ errors: {}, input: {
      age: 52, sex: 'male', bmi: 27.4, totalCholesterol: 5.6, glucose: 5.9,
    } });
  });
  it('reports every empty required field', () => {
    expect(Object.keys(validateInput({}, demoModelInfo.fields).errors)).toHaveLength(5);
  });
  it('does not invent medical ranges; handles zero and negative values', () => {
    const result = validateInput({ ...values, age: '0', bmi: '-2' }, demoModelInfo.fields);
    expect(result.errors).toEqual({});
    expect(result.input).toMatchObject({ age: 0, bmi: -2 });
  });
  it('enforces approved configuration only', () => {
    const fields: FieldDefinition[] = [{ key: 'age', label: 'Age', type: 'number', unit: 'years', required: true, min: 18, max: 90, integer: true }];
    for (const age of ['17', '91', '20.5']) expect(validateInput({ age }, fields).errors.age).toBeTruthy();
    expect(validateInput({ age: '18' }, fields).errors).toEqual({});
  });
  it('omits an empty optional field and rejects unknown select values', () => {
    expect(validateInput({ optional: '' }, [{ key: 'optional', label: 'Optional', type: 'number', required: false, unit: 'u' }])).toEqual({ errors: {}, input: {} });
    expect(validateInput({ ...values, sex: 'invalid' }, demoModelInfo.fields).errors.sex).toBeTruthy();
  });
  it('uses configured precision or preserves the value', () => {
    expect(formatPrediction(134.23456, null)).toBe('134,23456');
    expect(formatPrediction(134.23456, 1)).toBe('134,2');
    expect(formatPrediction(134, 2)).toBe('134,00');
  });
});
