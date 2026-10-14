import type { Copy } from '../i18n/ru';
import { Icon } from './Icon';

export function UnavailableNotice({ copy, id }: { copy: Copy; id?: string }) {
  return <p className="unavailable-note" id={id}><Icon name="info" /><span>{copy.pages.unavailable}</span></p>;
}
