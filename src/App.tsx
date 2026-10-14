import { useEffect, useRef, useState } from 'react';
import { copies, type Language } from './i18n';
import { mode } from './config/environment';
import { usePrediction } from './hooks/usePrediction';
import { useNavigation } from './hooks/useNavigation';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { HomePage } from './pages/HomePage';
import { PredictionPage } from './pages/PredictionPage';
import { AuthPage, type AuthScreen } from './pages/AuthPage';
import { AccountPage, AccountDeletionPage } from './pages/AccountPage';
import { HistoryPage } from './pages/HistoryPage';
import { InformationPage } from './pages/InformationPage';

const authRoutes: Record<string, AuthScreen> = {
  '/login': 'login', '/register': 'register', '/forgot-password': 'forgot',
  '/reset-password': 'reset', '/verify-email': 'verify', '/account/password': 'password',
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ru');
  const flow = usePrediction();
  const route = useNavigation(flow.invalidate);
  const copy = copies[language];
  const main = useRef<HTMLElement>(null);
  const landing = route === '/' || route === '/how' || route === '/team';
  const auth = authRoutes[route];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.pageTitle;
  }, [language, copy]);

  useEffect(() => {
    const target = route === '/how' ? document.getElementById('how-heading')
      : route === '/team' ? document.getElementById('team-heading') : main.current?.querySelector('h1');
    target?.setAttribute('tabindex', '-1');
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
      if (route === '/how' || route === '/team') target.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    }
  }, [route]);

  return <>
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>{copy.skip}</a>
    <SiteHeader copy={copy} language={language} onLanguageChange={setLanguage} />
    <main id="main" className={`container page-content ${landing ? 'landing-content' : ''}`} ref={main} tabIndex={-1}>
      {landing ? <HomePage copy={copy} language={language} />
        : route === '/predict' ? <PredictionPage flow={flow} copy={copy} language={language} />
        : auth ? <AuthPage key={auth} screen={auth} copy={copy} />
        : route === '/account' ? <AccountPage copy={copy} />
        : route === '/account/delete' ? <AccountDeletionPage copy={copy} />
        : route === '/history' || route.startsWith('/history/') ? <HistoryPage copy={copy} detail={route !== '/history'} />
        : <InformationPage route={route} copy={copy} model={mode === 'real' && flow.metadata.status === 'ready' ? flow.metadata.model : undefined} />}
    </main>
    <SiteFooter copy={copy} />
  </>;
}
