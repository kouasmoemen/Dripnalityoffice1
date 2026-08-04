type IconProps = { className?: string };

const base = 'size-5 stroke-[1.8]';
export function SearchIcon({ className = base }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4.4 4.4"/></svg>; }
export function HeartIcon({ className = base }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true"><path d="M20.8 8.7c0 5.3-8.8 10.3-8.8 10.3S3.2 14 3.2 8.7A4.3 4.3 0 0 1 11 6.2l1 1.1 1-1.1a4.3 4.3 0 0 1 7.8 2.5Z"/></svg>; }
export function AccountIcon({ className = base }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.5 2.8-5.3 6.5-5.3s5.9 1.8 6.5 5.3"/></svg>; }
export function BagIcon({ className = base }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true"><path d="M5.2 8.5h13.6l-1.1 12H6.3l-1.1-12Z"/><path d="M8.6 8.5V6.7A3.4 3.4 0 0 1 12 3.3a3.4 3.4 0 0 1 3.4 3.4v1.8"/></svg>; }
