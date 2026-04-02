/**
 * Sidebar — Collapsible navigation with framer-motion
 * Inspired by Linear / Vercel sidebar patterns
 */

import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Zap,
  SlidersHorizontal,
  TrendingUp,
  Users,
  PanelLeftClose,
  PanelLeft,
  Bell,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/simulate', label: 'Simulate', icon: Zap },
  { path: '/rules', label: 'Rules', icon: SlidersHorizontal },
  { path: '/escalation', label: 'Escalation', icon: TrendingUp },
  { path: '/users-teams', label: 'Users & Teams', icon: Users },
];

export default function Sidebar({ collapsed, onToggle, width }) {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Logo area */}
        <div
          className={clsx(
            'flex items-center h-16 border-b shrink-0',
            collapsed ? 'justify-center px-0' : 'px-5'
          )}
          style={{ borderColor: 'var(--color-border)' }}
        >
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 overflow-hidden w-full"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-indigo)' }}
                >
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    AlertOps
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-text-dim)' }}>
                    Incident Manager
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--color-indigo)' }}
                >
                  <Bell className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
                  isActive
                    ? ''
                    : 'hover:bg-[var(--color-surface-hover)]'
                )}
                style={
                  isActive
                    ? {
                        background: 'var(--color-indigo-dim)',
                        color: 'var(--color-indigo-hover)',
                      }
                    : { color: 'var(--color-text-muted)' }
                }
              >
                <Icon className={clsx('w-[18px] h-[18px] shrink-0 transition-colors', isActive ? '' : 'group-hover:text-[var(--color-text-secondary)]')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div
          className="p-3 border-t shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={onToggle}
            className={clsx(
              'flex items-center gap-2 rounded-xl text-sm transition-all duration-200 w-full',
              collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
              'hover:bg-[var(--color-surface-hover)]'
            )}
            style={{ color: 'var(--color-text-dim)' }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <PanelLeft className="w-[18px] h-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px]" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay — shown on small screens when sidebar is open */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
