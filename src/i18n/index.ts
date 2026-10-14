import type { FieldDefinition } from '../types';
import { en } from './en';
import { kk } from './kk';
import { ru, type Copy } from './ru';

export const copies = { kk, ru, en };
export type Language = keyof typeof copies;
export const languages: { code: Language; label: string; short: string; flag: string }[] = [
  { code: 'kk', label: 'Қазақша', short: 'Қаз', flag: '/flags/kz.svg' },
  { code: 'ru', label: 'Русский', short: 'Рус', flag: '/flags/ru.svg' },
  { code: 'en', label: 'English', short: 'Eng', flag: '/flags/gb.svg' },
];

// Translate known client messages; preserve arbitrary server text as supplied by the API.
export function translateMessage(message: string | undefined, copy: Copy, field?: FieldDefinition): string | undefined {
  if (!message) return message;
  if (message === ru.validationSummary) return copy.validationSummary;
  if (message === ru.cancelled) return copy.cancelled;
  for (const key of Object.keys(ru.apiErrors) as (keyof Copy['apiErrors'])[]) {
    if (message === ru.apiErrors[key]) return copy.apiErrors[key];
  }
  for (const key of ['required', 'number', 'finite', 'integer', 'option'] as const) {
    if (message === ru.validation[key]) return copy.validation[key];
  }
  if (field?.type === 'number') {
    for (const key of ['min', 'max'] as const) {
      const value = field[key];
      if (value !== undefined && message === ru.validation[key](value)) return copy.validation[key](value);
    }
  }
  return message;
}
