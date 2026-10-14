import { flaticonPaths } from './flaticonPaths';
type IconName = keyof typeof flaticonPaths;

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} data-icon={name} width="24" height="24" viewBox="0 0 24 24"
    fill="currentColor" aria-hidden="true" focusable="false">
    <path d={flaticonPaths[name]} />
  </svg>;
}
