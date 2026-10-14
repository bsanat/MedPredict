type IconName = 'arrow' | 'pulse' | 'chart' | 'info' | 'lock';

const paths: Record<IconName, string> = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  pulse: 'M2 12h5l3-8 4 16 3-8h5',
  chart: 'M3 19l6-8 5 4 7-11',
  info: 'M12 11v6m0-10v.01',
  lock: 'M8 10V7a4 4 0 0 1 8 0v3M6 10h12v11H6zm6 4v3',
};

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'info' && <circle cx="12" cy="12" r="9" />}
    <path d={paths[name]} />
  </svg>;
}
