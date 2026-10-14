import type { ModelInfo } from '../types';

// Preliminary example from the report; no medical ranges have been approved.
export const demoModelInfo: ModelInfo = {
  indicatorName: 'Систолическое давление',
  unit: 'мм рт. ст.',
  decimalPlaces: 1,
  modelVersion: 'demo-example',
  fields: [
    { key: 'age', label: 'Возраст', type: 'number', unit: 'лет', required: true },
    {
      key: 'sex', label: 'Пол', type: 'select', required: true,
      options: [{ value: 'male', label: 'Мужской' }, { value: 'female', label: 'Женский' }],
    },
    { key: 'bmi', label: 'Индекс массы тела', type: 'number', unit: 'кг/м²', required: true },
    { key: 'totalCholesterol', label: 'Общий холестерин', type: 'number', unit: 'ммоль/л', required: true },
    { key: 'glucose', label: 'Глюкоза', type: 'number', unit: 'ммоль/л', required: true },
  ],
};
