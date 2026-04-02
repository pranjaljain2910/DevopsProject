/**
 * StatCard — A single metric card with icon, value, and color accent
 */

import clsx from 'clsx';

const COLORS = {
  indigo:  { bg: 'var(--color-indigo-dim)', text: 'var(--color-indigo)', border: 'rgba(99,102,241,0.2)' },
  red:     { bg: 'var(--color-red-dim)', text: 'var(--color-red)', border: 'rgba(239,68,68,0.2)' },
  amber:   { bg: 'var(--color-amber-dim)', text: 'var(--color-amber)', border: 'rgba(245,158,11,0.2)' },
  sky:     { bg: 'var(--color-sky-dim)', text: 'var(--color-sky)', border: 'rgba(56,189,248,0.2)' },
  green:   { bg: 'var(--color-green-dim)', text: 'var(--color-green)', border: 'rgba(34,197,94,0.2)' },
};

export default function StatCard({ label, value, icon: Icon, color = 'indigo' }) {
  const c = COLORS[color] || COLORS.indigo;

  return (
    <div
      className="card p-5 flex items-center gap-4 group cursor-default hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        style={{ background: c.bg, color: c.text }}
      >
        {Icon && <Icon className="w-5 h-5" strokeWidth={1.75} />}
      </div>
      <div className="min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider mb-1"
          style={{ color: 'var(--color-text-dim)' }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold tabular-nums"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
