import { useEffect, useRef, useState } from 'react';
import { mode } from '../config/environment';
import { copies, translateMessage, type Language } from '../i18n';
import { localizedDemoModel } from '../config/indicator';
import { LanguagePicker } from '../components/LanguagePicker';
import { usePrediction } from '../hooks/usePrediction';
import { Field } from '../components/Field';
import { Icon } from '../components/Icon';
import { ResultPanel } from '../components/ResultPanel';

export function HomePage() {
  const [language, setLanguage] = useState<Language>('ru');
  const [retrying, setRetrying] = useState(false);
  const copy = copies[language];
  const flow = usePrediction();
  const form = useRef<HTMLFormElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const demo = mode === 'demo';
  const retryAction = flow.state.status === 'error' || (flow.state.status === 'loading' && retrying);
  const model = flow.metadata.status === 'ready' ? demo ? localizedDemoModel(copy) : flow.metadata.model : undefined;

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.pageTitle;
  }, [language, copy]);

  function focusField(key?: string) {
    const element = key ? form.current?.elements.namedItem(key) : form.current?.querySelector('input, select');
    if (element instanceof HTMLElement) element.focus();
    else formHeading.current?.focus();
  }

  function goToForm() {
    formHeading.current?.scrollIntoView({ block: 'start' });
    focusField();
  }

  return <>
    <a className="skip-link" href="#main">{copy.skip}</a>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main" aria-label={copy.brandLink}><img className="brand-logo" src="/logo.png" alt={copy.brand} width="994" height="414" /></a>
        <nav aria-label={copy.navigation}><a href="#how-it-works">{copy.how}</a><a href="#about">{copy.about}</a></nav>
        <div className="header-actions"><span className="mode-label">{demo ? copy.demo : mode === 'real' ? copy.real : copy.unconfigured}</span>
          <LanguagePicker language={language} copy={copy} onChange={setLanguage} /></div>
      </div>
    </header>
    <main id="main" className="container" tabIndex={-1}>
      <section className="intro-section" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <h1 id="hero-heading">{copy.hero[0]}<br /><span>{copy.hero[1]}</span></h1>
          <p>{copy.intro}</p>
          <button type="button" className="button button-primary" onClick={goToForm}>{copy.goToForm}<Icon name="arrow" /></button>
        </div>
        <div id="how-it-works" className="how-it-works">
          <ol className="steps" aria-label={copy.how}>
            {copy.steps.map((step, index) => <li key={step.title}>
              <span className="step-number" aria-hidden="true">0{index + 1}</span>
              {index < 2 && <Icon className="step-arrow" name="arrow" />}
              <h2>{step.title}</h2><p>{step.description}</p>
            </li>)}
          </ol>
          <p className="intro-disclaimer">{copy.disclaimer}.</p>
        </div>
      </section>
      <div className="workspace">
        <section className="form-panel panel" aria-labelledby="form-heading">
          <div className="section-heading"><span className="section-number" aria-hidden="true">01</span><div>
            <h2 id="form-heading" ref={formHeading} tabIndex={-1}>{copy.formTitle}</h2>
            <p>{demo ? copy.preliminary : model?.indicatorName}</p>
          </div></div>
          {demo && <p className="contract-note"><Icon name="info" />{copy.contractPending}</p>}
          {flow.metadata.status === 'loading' ? <p className="metadata-status" role="status">{copy.metadataLoading}</p>
            : flow.metadata.status === 'error' ? <div className="metadata-error" role="alert">
              <h3>{copy.metadataErrorTitle}</h3><p>{translateMessage(flow.metadata.message, copy)}</p>
              <button className="button button-primary" type="button" onClick={flow.retryMetadata}><Icon name="retry" />{copy.metadataRetry}</button>
            </div> : <form ref={form} noValidate onSubmit={(event) => { event.preventDefault(); setRetrying(flow.state.status === 'error'); void flow.submit(focusField); }} aria-busy={flow.state.status === 'loading'}>
              <div className="fields-grid">
                {model?.fields.map((field) => <Field key={field.key} field={field}
                  copy={copy} value={flow.values[field.key] ?? ''} error={flow.errors[field.key]} onChange={flow.change} />)}
              </div>
              <div className="form-notes"><p>{copy.decimalHint}</p><p>{copy.requiredNote}</p></div>
              <p className={`form-status ${Object.keys(flow.errors).length ? 'has-error' : ''}`} role="status">{translateMessage(flow.state.status === 'idle' || flow.state.status === 'error' ? flow.state.message : '', copy)}</p>
              <button type="submit" className="button button-primary submit-button" disabled={flow.state.status === 'loading'} aria-busy={flow.state.status === 'loading'}>
                {retryAction ? copy.retrySubmit : copy.submit}
                <Icon name={retryAction ? 'retry' : 'arrow'} />
              </button>
            </form>}
        </section>
        <ResultPanel copy={copy} language={language} state={flow.state} model={model} demo={demo} onCancel={flow.cancel}
          onEdit={() => { flow.invalidate(); goToForm(); }} />
      </div>
      <section id="about" className="about-section" aria-labelledby="about-heading"><h2 id="about-heading">{copy.aboutTitle}</h2><p>{copy.aboutText}</p><p className="privacy-detail">{copy.privacyDetail}</p></section>
      <section className="student-project" aria-label={copy.studentProject}>
        <div className="project-logos">
          <span className="project-medpredict"><img src="/logo.png" alt="MedPredict" width="994" height="414" /></span>
          <img className="project-aitu" src="/aitu-logo.svg" alt="Astana IT University" width="522" height="228" />
        </div>
        <div className="project-caption"><p lang="ru">{copies.ru.studentProject}</p><p lang="kk">{copies.kk.studentProject}</p></div>
      </section>
    </main>
    <footer className="site-footer container"><span>{copy.footer}</span><span>{copy.footerYear}</span><a href="https://www.flaticon.com/uicons" target="_blank" rel="noopener noreferrer">Uicons by Flaticon</a></footer>
  </>;
}
