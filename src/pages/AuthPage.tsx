import type { Copy } from '../i18n/ru';
import { Icon } from '../components/Icon';
import { UnavailableNotice } from '../components/UnavailableNotice';

export type AuthScreen = 'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'password';

export function AuthPage({ screen, copy }: { screen: AuthScreen; copy: Copy }) {
  const fields = screen === 'verify' ? [] : screen === 'forgot' ? ['email']
    : screen === 'password' ? ['currentPassword', 'newPassword', 'confirmPassword']
    : screen === 'reset' ? ['newPassword', 'confirmPassword']
    : screen === 'register' ? ['email', 'newPassword', 'confirmPassword'] : ['email', 'password'];
  const labels: Record<string, string> = { email: copy.pages.email, password: copy.pages.password,
    currentPassword: copy.pages.currentPassword, newPassword: copy.pages.newPassword, confirmPassword: copy.pages.confirmPassword };

  return <section className="auth-page panel" aria-labelledby="auth-title">
    <Icon name={screen === 'forgot' || screen === 'verify' ? 'mail' : 'account'} />
    <h1 id="auth-title">{copy.pages.authTitles[screen]}</h1>
    <p>{screen === 'verify' ? copy.pages.verifyDescription : copy.pages.authIntro}</p>
    <UnavailableNotice copy={copy} id="auth-unavailable" />
    <form aria-describedby="auth-unavailable" onSubmit={(event) => event.preventDefault()}>
      <div className="fields-grid single">
        {fields.map((field) => <div className="field" key={field}>
          <label htmlFor={`auth-${field}`}>{labels[field]} <span className="required" aria-hidden="true">*</span></label>
          <div className="field-control"><input id={`auth-${field}`} type={field === 'email' ? 'email' : 'password'} disabled
            autoComplete={field === 'email' ? 'email' : field === 'password' || field === 'currentPassword' ? 'current-password' : 'new-password'}
            aria-describedby="auth-unavailable" placeholder={field === 'email' ? 'name@example.com' : labels[field]} /></div>
          {field !== 'email' && <p className="field-hint">{copy.pages.passwordHint}</p>}
        </div>)}
      </div>
      <button className="button button-primary submit-button" type="submit" disabled>{copy.pages.authActions[screen]}</button>
    </form>
    <div className="auth-links">
      {screen === 'login' ? <><a href="#/forgot-password">{copy.pages.forgotPassword}</a><a href="#/register">{copy.pages.register}</a></>
        : <a href="#/login">{copy.pages.backToLogin}</a>}
      {screen === 'register' && <a href="#/verify-email">{copy.pages.authTitles.verify}</a>}
      {screen === 'forgot' && <a href="#/reset-password">{copy.pages.authTitles.reset}</a>}
      <a href="#/predict">{copy.pages.predict}</a><a href="#/account">{copy.pages.account}</a>
    </div>
  </section>;
}
