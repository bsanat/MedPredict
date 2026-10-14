import { describe, expect, it } from 'vitest';
import { copies, translateMessage } from './index';
import { ru } from './ru';
import { demoModelInfo, localizedDemoModel } from '../config/indicator';
import { formatPrediction } from '../validation';
import type { FieldDefinition } from '../types';

describe('localization', () => {
  it.each(['kk', 'ru', 'en'] as const)('translates client errors and preserves unknown server text in %s', (language) => {
    const copy = copies[language];
    expect(translateMessage(ru.apiErrors.network, copy)).toBe(copy.apiErrors.network);
    expect(translateMessage(ru.validationSummary, copy)).toBe(copy.validationSummary);
    expect(translateMessage(ru.validation.required, copy)).toBe(copy.validation.required);
    const field: FieldDefinition = { key: 'x', label: 'Server field', type: 'number', unit: 'u', required: true, min: -2.5, max: 10 };
    expect(translateMessage(ru.validation.min(-2.5), copy, field)).toBe(copy.validation.min(-2.5));
    expect(translateMessage(ru.validation.max(10), copy, field)).toBe(copy.validation.max(10));
    expect(translateMessage('Server-supplied message', copy)).toBe('Server-supplied message');
    expect(translateMessage(undefined, copy)).toBeUndefined();
  });

  it('localizes the demo display without changing the API model or field values', () => {
    const model = localizedDemoModel(copies.en);
    expect(model.indicatorName).toBe('Systolic blood pressure');
    expect(model.fields.map((field) => field.key)).toEqual(demoModelInfo.fields.map((field) => field.key));
    expect(model.fields.find((field) => field.key === 'sex')).toMatchObject({
      options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }],
    });
    expect(demoModelInfo.indicatorName).toBe('Систолическое давление');
    expect(demoModelInfo.unit).toBe('мм рт. ст.');
    expect(formatPrediction(134.23456, null, 'en')).toBe('134.23456');
    expect(formatPrediction(134.23456, 1, 'kk')).toBe('134,2');
  });
});
