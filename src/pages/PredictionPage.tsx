import { useRef, useState } from 'react';
import { mode } from '../config/environment';
import { localizedDemoModel } from '../config/indicator';
import { translateMessage, type Language } from '../i18n';
import type { Copy } from '../i18n/ru';
import type { usePrediction } from '../hooks/usePrediction';
import { Field } from '../components/Field';
import { Icon } from '../components/Icon';
import { ResultPanel } from '../components/ResultPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function PredictionPage({ flow, copy, language }: {
  flow: ReturnType<typeof usePrediction>; copy: Copy; language: Language;
}) {
  const [retrying, setRetrying] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const demo = mode === 'demo';
  const retryAction = flow.state.status === 'error' || (flow.state.status === 'loading' && retrying);
  const model = flow.metadata.status === 'ready' ? demo ? localizedDemoModel(copy) : flow.metadata.model : undefined;
  const stage = flow.state.status === 'success' ? 2 : flow.state.status === 'loading' ? 1 : 0;

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
    <div className="page-intro"><h1>{copy.pages.inputTitle}</h1><p>{demo ? copy.preliminary : model?.indicatorName}</p>
      <button type="button" className="button button-secondary" onClick={goToForm}>{copy.goToForm}<Icon name="arrow" /></button>
    </div>
    <ol className="prediction-progress" aria-label={copy.how}>
      {copy.steps.map((step, index) => <li key={step.title} aria-current={index === stage ? 'step' : undefined}>
        <span aria-hidden="true">0{index + 1}</span>{step.title}
      </li>)}
    </ol>
    <div className="workspace">
      <section className="form-panel panel" aria-labelledby="form-heading">
        <div className="section-heading"><Icon name="form" /><div>
          <h2 id="form-heading" ref={formHeading} tabIndex={-1}>{copy.formTitle}</h2>
          <p>{demo ? copy.preliminary : model?.indicatorName}</p>
        </div></div>
        {demo && <p className="contract-note"><Icon name="info" />{copy.contractPending}</p>}
        {flow.metadata.status === 'loading' ? <p className="metadata-status" role="status">{copy.metadataLoading}</p>
          : flow.metadata.status === 'error' ? <div className="metadata-error" role="alert">
            <h3>{copy.metadataErrorTitle}</h3><p>{translateMessage(flow.metadata.message, copy)}</p>
            <button className="button button-primary" type="button" onClick={flow.retryMetadata}><Icon name="retry" />{copy.metadataRetry}</button>
          </div> : <form ref={form} noValidate onSubmit={(event) => {
            event.preventDefault(); setRetrying(flow.state.status === 'error'); void flow.submit(focusField);
          }} aria-busy={flow.state.status === 'loading'}>
            <div className="actions">
              {demo && <button className="button button-secondary" type="button" onClick={() => {
                flow.replaceValues({ age: '52', sex: 'male', bmi: '27,4', totalCholesterol: '5,6', glucose: '5,9' });
                focusField();
              }}><Icon name="example" />{copy.pages.fillExample}</button>}
              <button className="button button-secondary" type="button" disabled={!Object.values(flow.values).some(Boolean)}
                onClick={() => setConfirmClear(true)}><Icon name="clear" />{copy.pages.clear}</button>
            </div>
            <div className="fields-grid">
              {model?.fields.map((field) => <Field key={field.key} field={field}
                copy={copy} value={flow.values[field.key] ?? ''} error={flow.errors[field.key]} onChange={flow.change} />)}
            </div>
            <div className="form-notes"><p>{copy.decimalHint}</p><p>{copy.requiredNote}</p></div>
            <p className={`form-status ${Object.keys(flow.errors).length ? 'has-error' : ''}`} role="status">
              {translateMessage(flow.state.status === 'idle' || flow.state.status === 'error' ? flow.state.message : '', copy)}
            </p>
            <button type="submit" className="button button-primary submit-button" disabled={flow.state.status === 'loading'} aria-busy={flow.state.status === 'loading'}>
              {retryAction ? copy.retrySubmit : copy.submit}<Icon name={retryAction ? 'retry' : 'arrow'} />
            </button>
          </form>}
      </section>
      <ResultPanel copy={copy} language={language} state={flow.state} model={model} demo={demo} onCancel={flow.cancel}
        onEdit={() => { flow.invalidate(); goToForm(); }} onNew={() => { flow.replaceValues({}); goToForm(); }} />
    </div>
    <p className="prediction-notice">{copy.privacyDetail} <a href="#/model">{copy.pages.model}</a></p>
    <ConfirmDialog open={confirmClear} copy={copy} onCancel={() => setConfirmClear(false)} onConfirm={() => {
      flow.replaceValues({}); setConfirmClear(false);
    }} />
  </>;
}
