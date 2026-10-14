import { useRef } from 'react';
import { mode } from '../config/environment';
import { ru } from '../i18n/ru';
import { usePrediction } from '../hooks/usePrediction';
import { Field } from '../components/Field';
import { Icon } from '../components/Icon';
import { ResultPanel } from '../components/ResultPanel';

export function HomePage() {
  const flow = usePrediction();
  const form = useRef<HTMLFormElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const demo = mode === 'demo';
  const model = flow.metadata.status === 'ready' ? flow.metadata.model : undefined;

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
    <a className="skip-link" href="#main">{ru.skip}</a>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main" aria-label={ru.brandLink}>{ru.brand}<Icon name="pulse" /></a>
        <nav aria-label="Основная навигация"><a href="#how-it-works">{ru.how}</a><a href="#about">{ru.about}</a></nav>
        <span className="mode-label">{demo ? ru.demo : mode === 'real' ? ru.real : ru.unconfigured}</span>
      </div>
    </header>
    <main id="main" className="container" tabIndex={-1}>
      <section className="intro-section" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <h1 id="hero-heading">{ru.hero[0]}<br /><span>{ru.hero[1]}</span></h1>
          <p>{ru.intro}</p>
          <button type="button" className="button button-primary" onClick={goToForm}>{ru.goToForm}<Icon name="arrow" /></button>
        </div>
        <div id="how-it-works" className="how-it-works">
          <ol className="steps" aria-label={ru.how}>
            {ru.steps.map((step, index) => <li key={step.title}>
              <span className="step-number" aria-hidden="true">0{index + 1}</span>
              {index < 2 && <Icon className="step-arrow" name="arrow" />}
              <h2>{step.title}</h2><p>{step.description}</p>
            </li>)}
          </ol>
          <p className="intro-disclaimer">{ru.disclaimer}.</p>
        </div>
      </section>
      <div className="workspace">
        <section className="form-panel panel" aria-labelledby="form-heading">
          <div className="section-heading"><span className="section-number" aria-hidden="true">01</span><div>
            <h2 id="form-heading" ref={formHeading} tabIndex={-1}>{ru.formTitle}</h2>
            <p>{demo ? ru.preliminary : model?.indicatorName}</p>
          </div></div>
          {demo && <p className="contract-note"><Icon name="info" />{ru.contractPending}</p>}
          {flow.metadata.status === 'loading' ? <p className="metadata-status" role="status">{ru.metadataLoading}</p>
            : flow.metadata.status === 'error' ? <div className="metadata-error" role="alert">
              <h3>{ru.metadataErrorTitle}</h3><p>{flow.metadata.message}</p>
              <button className="button button-secondary" type="button" onClick={flow.retryMetadata}>{ru.metadataRetry}</button>
            </div> : <form ref={form} noValidate onSubmit={(event) => { event.preventDefault(); void flow.submit(focusField); }} aria-busy={flow.state.status === 'loading'}>
              <div className="fields-grid">
                {flow.metadata.model.fields.map((field) => <Field key={field.key} field={field}
                  value={flow.values[field.key] ?? ''} error={flow.errors[field.key]} onChange={flow.change} />)}
              </div>
              <div className="form-notes"><p>{ru.decimalHint}</p><p>{ru.requiredNote}</p></div>
              <p className="form-status" role="status">{flow.state.status === 'idle' ? flow.state.message : flow.state.status === 'error' ? flow.state.message : ''}</p>
              <button type="submit" className="button button-primary submit-button" disabled={flow.state.status === 'loading'}>
                {flow.state.status === 'loading' ? ru.loading : flow.state.status === 'error' ? ru.retrySubmit : ru.submit}
                {flow.state.status !== 'loading' && <Icon name="arrow" />}
              </button>
            </form>}
        </section>
        <ResultPanel state={flow.state} model={model} demo={demo} onCancel={flow.cancel}
          onEdit={() => { flow.invalidate(); goToForm(); }} />
      </div>
      <section id="about" className="about-section" aria-labelledby="about-heading"><h2 id="about-heading">{ru.aboutTitle}</h2><p>{ru.aboutText}</p><p className="privacy-detail">{ru.privacyDetail}</p></section>
    </main>
    <footer className="site-footer container"><span>{ru.footer}</span><span>{ru.footerYear}</span></footer>
  </>;
}
