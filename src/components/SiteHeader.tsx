import { mode } from '../config/environment';
import type { Copy } from '../i18n/ru';
import type { Language } from '../i18n';
import { Icon } from './Icon';
import { LanguagePicker } from './LanguagePicker';

export function SiteHeader({ copy, language, onLanguageChange }: {
  copy: Copy; language: Language; onLanguageChange: (language: Language) => void;
}) {
  return <header className="site-header">
    <div className="header-inner">
      <a className="brand" href="#/" aria-label={copy.brandLink}>
        <img className="brand-logo" src="/logo.png" alt={copy.brand} width="994" height="414" />
      </a>
      <nav aria-label={copy.navigation}>
        <a href="#/how">{copy.how}</a><a href="#/team">{copy.pages.team}</a><a href="#/model">{copy.about}</a>
      </nav>
      <div className="header-actions">
        <span className="mode-label">{mode === 'demo' ? copy.demo : mode === 'real' ? copy.real : copy.unconfigured}</span>
        <LanguagePicker language={language} copy={copy} onChange={onLanguageChange} />
        <a className="button button-secondary account-link" href="#/login" aria-label={copy.pages.login}><Icon name="account" /></a>
        <a className="button button-primary header-predict" href="#/predict">{copy.pages.predict}</a>
      </div>
    </div>
  </header>;
}
