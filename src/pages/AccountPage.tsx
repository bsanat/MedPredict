import type { Copy } from '../i18n/ru';
import { Icon } from '../components/Icon';
import { UnavailableNotice } from '../components/UnavailableNotice';

export function AccountPage({ copy }: { copy: Copy }) {
  return <>
    <div className="page-intro"><h1>{copy.pages.account}</h1></div>
    <UnavailableNotice copy={copy} id="account-unavailable" />
    <div className="account-grid">
      <section className="panel"><h2 className="icon-heading"><Icon name="account" />{copy.pages.accountAccess}</h2>
        <p>{copy.pages.accountEmail}</p><div className="actions">
          <a className="button button-secondary" href="#/account/password">{copy.pages.authTitles.password}</a>
          <button className="button button-secondary" disabled aria-describedby="account-unavailable">{copy.pages.logout}</button>
        </div>
      </section>
      <section className="panel"><h2 className="icon-heading"><Icon name="history" />{copy.pages.history}</h2>
        <p>{copy.pages.historyDescription}</p><a className="button button-secondary" href="#/history">{copy.pages.openHistory}</a>
      </section>
      <section className="panel"><h2 className="icon-heading"><Icon name="clear" />{copy.pages.deleteAccount}</h2>
        <p>{copy.pages.deleteDescription}</p><a className="button button-secondary" href="#/account/delete">{copy.pages.requestDeletion}</a>
      </section>
    </div>
  </>;
}

export function AccountDeletionPage({ copy }: { copy: Copy }) {
  return <section className="message-page panel"><Icon name="info" /><h1>{copy.pages.deleteAccount}</h1>
    <p>{copy.pages.deleteDescription}</p><UnavailableNotice copy={copy} id="delete-unavailable" />
    <div className="actions"><button className="button button-primary" disabled aria-describedby="delete-unavailable">{copy.pages.confirmDeletion}</button>
      <a className="button button-secondary" href="#/account">{copy.pages.keep}</a></div>
  </section>;
}
