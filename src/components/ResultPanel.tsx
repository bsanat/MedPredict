import { useEffect, useRef } from 'react';
import type { ModelInfo } from '../types';
import type { PredictionState } from '../hooks/usePrediction';
import { ru } from '../i18n/ru';
import { formatPrediction } from '../validation';
import { Icon } from './Icon';

interface Props {
  state: PredictionState;
  model?: ModelInfo;
  demo: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export function ResultPanel({ state, model, demo, onEdit, onCancel }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.status === 'success') heading.current?.focus();
  }, [state.status]);

  return <section className={`result-panel panel ${state.status === 'error' ? 'result-error' : ''}`} aria-labelledby="result-heading" aria-busy={state.status === 'loading'}>
    <div className="section-heading"><span className="section-number" aria-hidden="true">02</span><h2 id="result-heading">{ru.resultTitle}</h2></div>
    <div className="result-content" aria-live="polite" aria-atomic="true">
      {state.status === 'success' && model ? <div className="success-result">
        {demo && <p className="result-tag">{ru.demoResult}</p>}
        <h3 tabIndex={-1} ref={heading}>{model.indicatorName}</h3>
        <p className="prediction-value"><span>{formatPrediction(state.result.predictedValue, model.decimalPlaces)}</span><span className="prediction-unit">{state.result.unit}</span></p>
        {state.result.modelVersion && <p className="model-version">{demo ? ru.demoVersion : ru.modelVersion}: {state.result.modelVersion}</p>}
        {demo && <p className="demo-explanation">{ru.demoExplanation}</p>}
        <div className="result-disclaimer"><Icon name="info" /><p>{ru.disclaimer}.
          {state.result.disclaimer && state.result.disclaimer !== ru.disclaimer && <span className="server-disclaimer">{state.result.disclaimer}</span>}
        </p></div>
        <button className="button button-secondary" type="button" onClick={onEdit}>{ru.edit}<Icon name="arrow" /></button>
      </div> : state.status === 'loading' ? <div className="empty-result">
        <div className="spinner" aria-hidden="true" /><h3>{ru.loading}</h3>
        <p>{ru.loadingDescription}</p>
        <button type="button" className="button button-secondary" onClick={onCancel}>{ru.cancel}</button>
      </div> : state.status === 'error' ? <div className="empty-result error-message">
        <span className="result-symbol"><Icon name="info" /></span>
        <h3>{ru.errorTitle}</h3><p>{state.message}</p><p className="error-help">{ru.inputsKept}</p>
        <button className="button button-secondary" type="button" onClick={onEdit}>{ru.edit}</button>
      </div> : <div className="empty-result">
        <span className="result-symbol"><Icon name="chart" /></span>
        <h3>{ru.emptyTitle}</h3><p>{ru.emptyDescription}</p>
      </div>}
    </div>
    <div className="privacy"><Icon name="lock" /><span>{demo ? ru.demoPrivacy : ru.realPrivacy}</span></div>
  </section>;
}
