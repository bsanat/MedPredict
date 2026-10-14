import { demoModelInfo } from '../config/indicator';
import { ru } from '../i18n/ru';
import type { PredictionApi } from '../types';
import { ApiError } from './errors';

export type DemoScenario = 'success' | 'validation' | 'unavailable';

function delay(signal: AbortSignal, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

export function createDemoApi(scenario: DemoScenario): PredictionApi {
  return {
    getModelInfo: async (signal) => {
      signal.throwIfAborted();
      return demoModelInfo;
    },
    predict: async (_input, signal) => {
      await delay(signal, 900);
      if (scenario === 'validation') throw new ApiError('validation', ru.validationSummary,
        [{ field: 'age', message: ru.apiErrors.demoValidation }]);
      if (scenario === 'unavailable') throw new ApiError('server', ru.apiErrors.demoUnavailable);
      return { predictedValue: 134.2, unit: demoModelInfo.unit,
        modelVersion: 'demo-example', disclaimer: ru.disclaimer };
    },
  };
}
