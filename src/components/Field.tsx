import type { FieldDefinition } from '../types';
import { ru } from '../i18n/ru';

interface Props {
  field: FieldDefinition;
  value: string;
  error?: string;
  onChange: (key: string, value: string) => void;
}

export function Field({ field, value, error, onChange }: Props) {
  const id = `field-${field.key}`;
  const describedBy = [field.type === 'number' ? `${id}-unit` : '', field.hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const shared = { id, name: field.key, value, required: field.required,
    'aria-invalid': !!error, 'aria-describedby': describedBy,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(field.key, event.target.value) };
  return <div className={`field ${error ? 'field-invalid' : ''}`}>
    <label htmlFor={id}>{field.label}{field.required && <span className="required" aria-hidden="true"> *</span>}</label>
    <div className="field-control">
      {field.type === 'number' ? <>
        <input {...shared} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} placeholder={ru.placeholder} />
        <span className="unit" aria-hidden="true">{field.unit}</span>
        <span className="sr-only" id={`${id}-unit`}>{field.unit}</span>
      </> : <select {...shared} autoComplete="off">
        <option value="">{ru.select}</option>
        {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>}
    </div>
    {field.hint && <p className="field-hint" id={`${id}-hint`}>{field.hint}</p>}
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
