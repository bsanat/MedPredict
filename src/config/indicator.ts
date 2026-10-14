import type { ModelInfo } from '../types';
import type { Copy } from '../i18n/ru';

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

export function localizedDemoModel(copy: Copy): ModelInfo {
  const text = copy.demoIndicator;
  const labels: Record<string, string> = { age: text.age, sex: text.sex, bmi: text.bmi,
    totalCholesterol: text.totalCholesterol, glucose: text.glucose };
  const units: Record<string, string> = { age: text.years, bmi: text.bmiUnit,
    totalCholesterol: text.concentrationUnit, glucose: text.concentrationUnit };
  return { ...demoModelInfo, indicatorName: text.name, unit: text.unit,
    fields: demoModelInfo.fields.map((field) => ({ ...field, label: labels[field.key] ?? field.label,
      ...(field.type === 'number' ? { unit: units[field.key] ?? field.unit }
        : { options: field.options.map((option) => ({ ...option,
          label: option.value === 'male' ? text.male : text.female })) }),
    })),
  };
}
