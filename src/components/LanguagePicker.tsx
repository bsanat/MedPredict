import { useEffect, useRef } from 'react';
import { languages, type Language } from '../i18n';
import type { Copy } from '../i18n/ru';

export function LanguagePicker({ language, copy, onChange }: {
  language: Language; copy: Copy; onChange: (language: Language) => void;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const selected = languages.find((item) => item.code === language)!;

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && details.current && !details.current.contains(event.target)) {
        details.current.open = false;
      }
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  function close() {
    if (!details.current) return;
    details.current.open = false;
    details.current.querySelector('summary')?.focus();
  }

  return <details className="language-picker" ref={details} onKeyDown={(event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
  }}>
    <summary aria-label={`${copy.language}: ${selected.label}`}>
      <img className="language-flag" src={selected.flag} alt="" width="28" height="20" />
      <span>{selected.short}</span><span className="language-chevron" aria-hidden="true" />
    </summary>
    <div className="language-options" role="group" aria-label={copy.language}>
      {languages.map((item) => <button key={item.code} type="button" lang={item.code}
        aria-pressed={language === item.code} onClick={() => { onChange(item.code); close(); }}>
        <img className="language-flag" src={item.flag} alt="" width="28" height="20" /><span>{item.label}</span>
        {language === item.code && <span className="language-check" aria-hidden="true">✓</span>}
      </button>)}
    </div>
  </details>;
}
