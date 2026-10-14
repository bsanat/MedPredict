import { ru } from '../i18n/ru';

export type ApiErrorKind = 'network' | 'timeout' | 'server' | 'badRequest' | 'unexpected' | 'validation' | 'configuration';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly fields: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : ru.apiErrors.unexpected;
}
