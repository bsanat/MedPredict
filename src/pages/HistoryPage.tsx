import type { Copy } from '../i18n/ru';
import { Icon } from '../components/Icon';
import { UnavailableNotice } from '../components/UnavailableNotice';

export function HistoryPage({ copy, detail = false }: { copy: Copy; detail?: boolean }) {
  return <>
    <div className="page-intro"><h1>{detail ? copy.pages.savedResult : copy.pages.history}</h1><p>{copy.pages.historyDescription}</p></div>
    <section className="panel empty-state"><Icon name="history" /><h2>{copy.pages.historyUnavailable}</h2>
      <UnavailableNotice copy={copy} id="history-unavailable" />
      <div className="actions"><a className="button button-primary" href="#/predict">{copy.pages.predict}</a>
        <button className="button button-secondary" disabled aria-describedby="history-unavailable">{copy.pages.clearHistory}</button>
        <a className="button button-secondary" href={detail ? '#/history' : '#/account'}>{detail ? copy.pages.history : copy.pages.account}</a>
      </div>
    </section>
  </>;
}
