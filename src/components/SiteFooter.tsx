import { copies } from '../i18n';
import type { Copy } from '../i18n/ru';

export function SiteFooter({ copy }: { copy: Copy }) {
  return <div className="container">
    <section className="student-project" aria-label={copy.studentProject}>
      <div className="project-logos">
        <span className="project-medpredict"><img src="/logo.png" alt="MedPredict" width="994" height="414" /></span>
        <img className="project-aitu" src="/aitu-logo.svg" alt="Astana IT University" width="522" height="228" />
      </div>
      <div className="project-caption"><p lang="ru">{copies.ru.studentProject}</p><p lang="kk">{copies.kk.studentProject}</p></div>
    </section>
    <footer className="site-footer">
      <span>{copy.footer}</span><span>{copy.footerYear}</span>
      <div className="footer-links"><a href="#/privacy">{copy.pages.privacy}</a><a href="#/terms">{copy.pages.terms}</a></div>
      <a href="https://www.flaticon.com/uicons" target="_blank" rel="noopener noreferrer">Uicons by Flaticon</a>
    </footer>
  </div>;
}
