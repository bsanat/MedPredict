import type { FieldDefinition, ModelInfo, Prediction } from '../types';
import { ru } from '../i18n/ru';
import { ApiError } from './errors';

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const optionalText = (value: unknown) => value === undefined || text(value);
const unexpected = () => new ApiError('unexpected', ru.apiErrors.unexpected);

export function parsePrediction(value: unknown, expectedUnit?: string): Prediction {
  if (!record(value) || !finite(value.predictedValue) || !text(value.unit)
    || !optionalText(value.modelVersion) || !optionalText(value.disclaimer)
    || (expectedUnit !== undefined && value.unit !== expectedUnit)) throw unexpected();
  return {
    predictedValue: value.predictedValue,
    unit: value.unit,
    ...(value.modelVersion === undefined ? {} : { modelVersion: value.modelVersion as string }),
    ...(value.disclaimer === undefined ? {} : { disclaimer: value.disclaimer as string }),
  };
}

function parseField(value: unknown): FieldDefinition {
  if (!record(value) || !text(value.key) || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value.key)
    || ['constructor', 'prototype', '__proto__'].includes(value.key)
    || !text(value.label) || typeof value.required !== 'boolean' || !optionalText(value.hint)) throw unexpected();
  const common = { key: value.key, label: value.label, required: value.required,
    ...(value.hint === undefined ? {} : { hint: value.hint as string }) };
  if (value.type === 'number') {
    if (!text(value.unit) || (value.min !== undefined && !finite(value.min))
      || (value.max !== undefined && !finite(value.max))
      || (finite(value.min) && finite(value.max) && value.min > value.max)
      || (value.integer !== undefined && typeof value.integer !== 'boolean')) throw unexpected();
    return { ...common, type: 'number', unit: value.unit,
      ...(value.min === undefined ? {} : { min: value.min as number }),
      ...(value.max === undefined ? {} : { max: value.max as number }),
      ...(value.integer === undefined ? {} : { integer: value.integer as boolean }) };
  }
  if (value.type === 'select' && Array.isArray(value.options) && value.options.length > 0) {
    const options = value.options.map((option: unknown) => {
      if (!record(option) || !text(option.value) || !text(option.label)) throw unexpected();
      return { value: option.value, label: option.label };
    });
    if (new Set(options.map((option) => option.value)).size !== options.length) throw unexpected();
    return { ...common, type: 'select', options };
  }
  throw unexpected();
}

// Proposed GET contract; must be agreed with the Spring Boot implementation.
export function parseModelInfo(value: unknown): ModelInfo {
  if (!record(value) || !text(value.indicatorName) || !text(value.unit)
    || !optionalText(value.modelVersion)
    || !(value.decimalPlaces === null || (finite(value.decimalPlaces)
      && Number.isInteger(value.decimalPlaces) && value.decimalPlaces >= 0 && value.decimalPlaces <= 20))
    || !Array.isArray(value.fields) || value.fields.length === 0) throw unexpected();
  const fields = value.fields.map(parseField);
  if (new Set(fields.map((field) => field.key)).size !== fields.length) throw unexpected();
  return { indicatorName: value.indicatorName, unit: value.unit,
    decimalPlaces: value.decimalPlaces, fields,
    ...(value.modelVersion === undefined ? {} : { modelVersion: value.modelVersion as string }) };
}

export function parseValidationError(value: unknown): ApiError {
  if (!record(value) || value.error !== 'VALIDATION_ERROR' || !Array.isArray(value.fields)
    || value.fields.length === 0) throw unexpected();
  const fields = value.fields.map((item: unknown) => {
    if (!record(item) || !text(item.field) || !text(item.message)) throw unexpected();
    return { field: item.field, message: item.message };
  });
  return new ApiError('validation', ru.validationSummary, fields);
}
