import { useEffect, useRef, useState } from 'react';
import type { FormValues, FieldErrors, ModelInfo, Prediction, PredictionApi, PredictionInput } from '../types';
import { configuredApi } from '../config/environment';
import { ApiError, errorMessage } from '../api/errors';
import { parsePrediction } from '../api/contract';
import { ru } from '../i18n/ru';
import { validateInput } from '../validation';

type MetadataState = { status: 'loading' } | { status: 'error'; message: string }
  | { status: 'ready'; model: ModelInfo };
export type PredictionState = { status: 'idle'; message?: string } | { status: 'loading' }
  | { status: 'success'; result: Prediction; input: PredictionInput } | { status: 'error'; message: string };

export function usePrediction() {
  const [metadata, setMetadata] = useState<MetadataState>({ status: 'loading' });
  const [reload, setReload] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<PredictionState>({ status: 'idle' });
  const service = useRef<PredictionApi | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const api = configuredApi();
        const model = await api.getModelInfo(controller.signal);
        if (controller.signal.aborted) return;
        service.current = api;
        setMetadata({ status: 'ready', model });
      } catch (error) {
        if (!controller.signal.aborted) setMetadata({ status: 'error', message: errorMessage(error) });
      }
    }
    void load();
    return () => controller.abort();
  }, [reload]);

  useEffect(() => () => request.current?.abort(), []);

  function invalidate() {
    request.current?.abort();
    request.current = null;
    setState({ status: 'idle' });
  }

  function change(key: string, value: string) {
    invalidate();
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  async function submit(focusField: (key: string) => void) {
    if (request.current || metadata.status !== 'ready' || !service.current) return;
    const checked = validateInput(values, metadata.model.fields);
    setErrors(checked.errors);
    const firstError = metadata.model.fields.find((field) => checked.errors[field.key]);
    if (firstError) {
      setState({ status: 'idle', message: ru.validationSummary });
      focusField(firstError.key);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setState({ status: 'loading' });
    try {
      const response = await service.current.predict(checked.input, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      setState({ status: 'success', result: parsePrediction(response, metadata.model.unit), input: checked.input });
    } catch (error) {
      if (request.current !== controller || controller.signal.aborted) return;
      let message = errorMessage(error);
      if (error instanceof ApiError && error.kind === 'validation') {
        const knownKeys = new Set(metadata.model.fields.map((field) => field.key));
        const fieldErrors: FieldErrors = {};
        for (const item of error.fields) {
          if (knownKeys.has(item.field)) fieldErrors[item.field] = item.message;
          else message = ru.apiErrors.unknownField;
        }
        setErrors(fieldErrors);
        const first = metadata.model.fields.find((field) => fieldErrors[field.key]);
        if (first) focusField(first.key);
      }
      setState({ status: 'error', message });
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  function cancel() {
    invalidate();
    setState({ status: 'idle', message: ru.cancelled });
  }

  function retryMetadata() {
    setMetadata({ status: 'loading' });
    setReload((count) => count + 1);
  }

  return { metadata, values, errors, state, change, submit, cancel, invalidate, retryMetadata };
}
