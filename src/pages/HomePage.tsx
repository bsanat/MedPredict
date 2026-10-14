import { mode } from '../config/environment';
import type { Language } from '../i18n';
import type { Copy } from '../i18n/ru';
import { Icon } from '../components/Icon';
import { formatPrediction } from '../validation';

const team = [
  { name: 'Оралхан Сеилхан', role: 'Backend Developer', initials: 'ОС' },
  { name: 'Санат Богенбаев', role: 'Frontend Developer', initials: 'СБ' },
  { name: 'Али Баймен', role: 'QA Developer', initials: 'АБ' },
];
const stepIcons = ['form', 'send', 'chart'] as const;

export function HomePage({ copy, language }: { copy: Copy; language: Language }) {
  const demo = mode === 'demo';
  return <>
    <section className="doctor-hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading">{copy.hero[0]}<br /><span>{copy.hero[1]}</span></h1>
        <p>{demo ? copy.pages.demoIntro : copy.pages.realIntro}</p>
        <div className="actions"><a className="button button-primary" href="#/predict">{demo ? copy.pages.tryDemo : copy.pages.predict}<Icon name="arrow" /></a>
          <a className="button button-secondary" href="#/how">{copy.how}</a></div>
        <p className="hero-warning"><Icon name="info" /><span>{copy.pages.heroWarning}</span></p>
      </div>
      <div className="doctor-visual">
        <img className="doctor-photo" src="/doctor-hero-blue.png" alt={copy.pages.doctorAlt} width="1024" height="1024" fetchPriority="high" />
        <div className="ai-label"><Icon name="brain" /><span>{copy.pages.aiLabel}</span></div>
        {demo && <div className="hero-result">
          <div className="hero-result-heading"><Icon name="pulse" /><span>{copy.pages.demoPreview}</span></div>
          <p>{copy.demoIndicator.name}</p>
          <strong>{formatPrediction(134.2, 1, language)} <small>{copy.demoIndicator.unit}</small></strong>
          <p className="hero-result-note">{copy.pages.demoPreviewNote}</p>
        </div>}
      </div>
    </section>
    <section id="how-it-works" className="how-section" aria-labelledby="how-heading">
      <h2 id="how-heading" tabIndex={-1}>{copy.how}</h2>
      <ol className="process-steps">
        {copy.steps.map((step, index) => <li key={step.title}>
          <div className="process-icon"><span aria-hidden="true">0{index + 1}</span><Icon name={stepIcons[index]!} />
            {index < 2 && <Icon className="process-arrow" name="arrow" />}</div>
          <h3>{step.title}</h3><p>{step.description}</p>
        </li>)}
      </ol>
    </section>
    <section id="team" className="team-section" aria-labelledby="team-heading">
      <h2 id="team-heading" tabIndex={-1}>{copy.pages.teamTitle}</h2>
      <div className="team">{team.map((member) => <article className="developer" key={member.name}>
        <span className="initials" aria-hidden="true">{member.initials}</span><div><h3>{member.name}</h3><p>{member.role}</p></div>
      </article>)}</div>
    </section>
    <div className="landing-limitations"><Icon name="info" /><p>{copy.aboutText}</p><a href="#/limitations">{copy.pages.limitationsLink}</a></div>
  </>;
}
