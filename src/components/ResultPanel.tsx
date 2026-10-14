import { useEffect, useRef } from 'react';
import type { ModelInfo } from '../types';
import type { PredictionState } from '../hooks/usePrediction';
import type { Copy } from '../i18n/ru';
import { translateMessage, type Language } from '../i18n';
import { formatPrediction } from '../validation';
import { Icon } from './Icon';

interface Props {
  state: PredictionState;
  copy: Copy;
  language: Language;
  model?: ModelInfo;
  demo: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export function ResultPanel({ state, copy, language, model, demo, onEdit, onCancel }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.status === 'success') heading.current?.focus();
  }, [state.status]);

  return <section className={`result-panel panel ${state.status === 'error' ? 'result-error' : ''}`} aria-labelledby="result-heading" aria-busy={state.status === 'loading'}>
    <div className="section-heading"><span className="section-number" aria-hidden="true">02</span><h2 id="result-heading">{copy.resultTitle}</h2></div>
    <div className="result-content" aria-live="polite" aria-atomic="true">
      {state.status === 'success' && model ? <div className="success-result">
        {demo && <p className="result-tag">{copy.demoResult}</p>}
        <h3 tabIndex={-1} ref={heading}>{model.indicatorName}</h3>
        <p className="prediction-value"><span>{formatPrediction(state.result.predictedValue, model.decimalPlaces, language)}</span><span className="prediction-unit">{demo ? model.unit : state.result.unit}</span></p>
        {state.result.modelVersion && <p className="model-version">{demo ? copy.demoVersion : copy.modelVersion}: {state.result.modelVersion}</p>}
        {demo && <p className="demo-explanation">{copy.demoExplanation}</p>}
        <div className="result-disclaimer"><Icon name="info" /><p>{copy.disclaimer}.
          {!demo && state.result.disclaimer && state.result.disclaimer !== copy.disclaimer && <span className="server-disclaimer">{state.result.disclaimer}</span>}
        </p></div>
        <button className="button button-secondary" type="button" onClick={onEdit}>{copy.edit}<Icon name="arrow" /></button>
      </div> : state.status === 'loading' ? <div className="empty-result">
        <div className="spinner" aria-hidden="true" /><h3>{copy.loading}</h3>
        <p>{copy.loadingDescription}</p>
        <button type="button" className="button button-secondary" onClick={onCancel}>{copy.cancel}</button>
      </div> : state.status === 'error' ? <div className="empty-result error-message">
        <span className="result-symbol"><Icon name="info" /></span>
        <h3>{copy.errorTitle}</h3><p>{translateMessage(state.message, copy)}</p><p className="error-help">{copy.inputsKept}</p>
        <button className="button button-secondary" type="button" onClick={onEdit}>{copy.edit}</button>
      </div> : <div className="empty-result">
        <span className="result-symbol"><Icon name="chart" /></span>
        <h3>{copy.emptyTitle}</h3><p>{copy.emptyDescription}</p>
      </div>}
    </div>
    <div className="privacy"><Icon name="lock" /><span>{demo ? copy.demoPrivacy : copy.realPrivacy}</span></div>
  </section>;
}
