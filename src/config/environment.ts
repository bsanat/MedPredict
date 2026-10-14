import type { PredictionApi } from '../types';
import { createDemoApi } from '../api/demo';
import { createHttpApi } from '../api/http';
import { ApiError } from '../api/errors';
import { ru } from '../i18n/ru';

export const mode = import.meta.env.VITE_API_MODE;

export function configuredApi(): PredictionApi {
  if (mode === 'demo') {
    const scenario = import.meta.env.VITE_DEMO_SCENARIO;
    if (scenario !== 'success' && scenario !== 'validation' && scenario !== 'unavailable') {
      throw new ApiError('configuration', ru.apiErrors.configuration);
    }
    return createDemoApi(scenario);
  }
  if (mode === 'real') {
    const baseUrl: string = import.meta.env.VITE_API_BASE_URL ?? '';
    const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? '15000');
    if ((baseUrl && !/^https?:\/\//.test(baseUrl)) || !Number.isInteger(timeoutMs)
      || timeoutMs < 1 || timeoutMs > 2147483647) throw new ApiError('configuration', ru.apiErrors.configuration);
    return createHttpApi(baseUrl, timeoutMs);
  }
  throw new ApiError('configuration', ru.apiErrors.configuration);
}
