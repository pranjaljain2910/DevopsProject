/**
 * StatusBadge & SeverityBadge — Colored status indicators
 */

import clsx from 'clsx';

const STATUS = {
  triggered:    { bg: 'var(--color-red-dim)', text: 'var(--color-red)', dot: 'var(--color-red)', label: 'Triggered', pulse: true },
  acknowledged: { bg: 'var(--color-sky-dim)', text: 'var(--color-sky)', dot: 'var(--color-sky)', label: 'Acknowledged' },
  escalated:    { bg: 'var(--color-amber-dim)', text: 'var(--color-amber)', dot: 'var(--color-amber)', label: 'Escalated' },
  resolved:     { bg: 'var(--color-green-dim)', text: 'var(--color-green)', dot: 'var(--color-green)', label: 'Resolved' },
};

const SEVERITY = {
  critical: { bg: 'var(--color-red-dim)', text: 'var(--color-red)', border: 'rgba(239,68,68,0.2)' },
  high:     { bg: 'var(--color-amber-dim)', text: 'var(--color-amber)', border: 'rgba(245,158,11,0.2)' },
  medium:   { bg: 'var(--color-sky-dim)', text: 'var(--color-sky)', border: 'rgba(56,189,248,0.2)' },
  low:      { bg: 'rgba(100,116,139,0.1)', text: 'var(--color-text-muted)', border: 'rgba(100,116,139,0.2)' },
};

export function StatusBadge({ status }) {
  const c = STATUS[status] || STATUS.triggered;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', c.pulse && 'animate-pulse')}
        style={{ background: c.dot }}
      />
      {c.label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const c = SEVERITY[severity] || SEVERITY.low;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {severity}
    </span>
  );
}

export function RoleBadge({ role }) {
  const ROLE = {
    admin:     { bg: 'var(--color-violet-dim)', text: 'var(--color-violet)' },
    responder: { bg: 'var(--color-indigo-dim)', text: 'var(--color-indigo)' },
    observer:  { bg: 'rgba(100,116,139,0.1)', text: 'var(--color-text-muted)' },
  };
  const c = ROLE[role] || ROLE.observer;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize"
      style={{ background: c.bg, color: c.text }}
    >
      {role}
    </span>
  );
}
