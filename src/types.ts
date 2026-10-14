export type FieldDefinition = {
  key: string;
  label: string;
  required: boolean;
  hint?: string;
} & (
  | { type: 'number'; unit: string; min?: number; max?: number; integer?: boolean }
  | { type: 'select'; options: { value: string; label: string }[] }
);

export interface ModelInfo {
  indicatorName: string;
  unit: string;
  // null preserves the server value without rounding.
  decimalPlaces: number | null;
  fields: FieldDefinition[];
  modelVersion?: string;
}

export type FormValues = Record<string, string>;
export type FieldErrors = Record<string, string>;
export type PredictionInput = Record<string, number | string>;

export interface Prediction {
  predictedValue: number;
  unit: string;
  modelVersion?: string;
  disclaimer?: string;
}

export interface PredictionApi {
  getModelInfo(signal: AbortSignal): Promise<ModelInfo>;
  predict(input: PredictionInput, signal: AbortSignal): Promise<Prediction>;
}
