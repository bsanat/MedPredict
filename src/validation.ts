import { ru } from './i18n/ru';
import type { FieldDefinition, FieldErrors, FormValues, PredictionInput } from './types';

export function parseNumber(value: string): number | undefined {
  const normalized = value.trim().replace(',', '.');
  if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

export function validateInput(values: FormValues, fields: FieldDefinition[]) {
  const errors: FieldErrors = {};
  const input: PredictionInput = {};
  for (const field of fields) {
    const value = (values[field.key] ?? '').trim();
    if (!value) {
      if (field.required) errors[field.key] = ru.validation.required;
      continue;
    }
    if (field.type === 'select') {
      if (!field.options.some((option) => option.value === value)) errors[field.key] = ru.validation.option;
      else input[field.key] = value;
      continue;
    }
    const number = parseNumber(value);
    if (number === undefined) errors[field.key] = ru.validation.number;
    else if (field.integer && !Number.isInteger(number)) errors[field.key] = ru.validation.integer;
    else if (field.min !== undefined && number < field.min) errors[field.key] = ru.validation.min(field.min);
    else if (field.max !== undefined && number > field.max) errors[field.key] = ru.validation.max(field.max);
    else input[field.key] = number;
  }
  return { errors, input };
}

export function formatPrediction(value: number, decimalPlaces: number | null): string {
  return (decimalPlaces === null ? String(value) : value.toFixed(decimalPlaces)).replace('.', ',');
}
