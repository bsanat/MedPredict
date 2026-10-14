import type { PredictionApi } from '../types';
import { ru } from '../i18n/ru';
import { parseModelInfo, parsePrediction, parseValidationError } from './contract';
import { ApiError } from './errors';

export function createHttpApi(baseUrl: string, timeoutMs: number): PredictionApi {
  async function request(path: string, signal: AbortSignal, body?: unknown): Promise<unknown> {
    const timeout = AbortSignal.timeout(timeoutMs);
    const combined = AbortSignal.any([signal, timeout]);
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        signal: combined,
        headers: body === undefined ? { Accept: 'application/json' }
          : { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      });
      if (response.status >= 500) throw new ApiError('server', ru.apiErrors.server);
      let value: unknown;
      try { value = await response.json(); }
      catch { throw new ApiError('unexpected', ru.apiErrors.unexpected); }
      if (response.status === 400) throw parseValidationError(value);
      if (!response.ok) throw new ApiError('badRequest', ru.apiErrors.badRequest);
      return value;
    } catch (error) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (timeout.aborted) throw new ApiError('timeout', ru.apiErrors.timeout);
      if (error instanceof ApiError) throw error;
      throw new ApiError('network', ru.apiErrors.network);
    }
  }
  return {
    getModelInfo: async (signal) => parseModelInfo(await request('/api/v1/model/info', signal)),
    predict: async (input, signal) => parsePrediction(await request('/api/v1/predictions', signal, input)),
  };
}
