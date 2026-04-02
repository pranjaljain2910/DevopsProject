/**
 * Navbar — Sticky top navbar with page title, breadcrumbs, live indicator, avatar
 */

import { useLocation } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Monitor and manage active alerts' },
  '/simulate': { title: 'Alert Simulation', subtitle: 'Trigger test alerts for your routing engine' },
  '/rules': { title: 'Routing Rules', subtitle: 'Configure how alerts are routed to teams' },
  '/escalation': { title: 'Escalation Policies', subtitle: 'Define escalation chains for unacknowledged alerts' },
  '/users-teams': { title: 'Users & Teams', subtitle: 'Manage responders and on-call teams' },
};

export default function Navbar() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'AlertOps', subtitle: '' };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-8 border-b backdrop-blur-md"
      style={{
        background: 'rgba(11, 15, 26, 0.8)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Left — title + subtitle */}
      <div className="min-w-0">
        <h1
          className="text-lg font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {page.title}
        </h1>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--color-green-dim)' }}>
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--color-green)', animation: 'pulse-dot 2s ease-in-out infinite' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: 'var(--color-green)' }}
            />
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>Live</span>
        </div>

        {/* Avatar placeholder */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'var(--color-indigo-dim)',
            color: 'var(--color-indigo)',
          }}
        >
          OP
        </div>
      </div>
    </header>
  );
}
