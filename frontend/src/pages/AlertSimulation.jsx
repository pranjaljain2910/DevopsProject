/**
 * Alert Simulation — Quick trigger templates + custom alert form
 */

import { useState, useEffect } from 'react';
import { alertsAPI, usersAPI, teamsAPI } from '../api/client';
import PageContainer from '../components/PageContainer';
import toast from 'react-hot-toast';
import {
  Flame,
  Skull,
  MemoryStick,
  HardDrive,
  Lock,
  Timer,
  Zap,
  Send,
} from 'lucide-react';

const TEMPLATES = [
  { title: 'High CPU on prod-web-01', description: 'CPU utilization exceeded 80% for 5+ minutes on production web server 01.', severity: 'critical', icon: Flame },
  { title: 'Server Down: api-gateway', description: 'API gateway is not responding to health checks. All downstream services affected.', severity: 'critical', icon: Skull },
  { title: 'Memory Leak in auth-service', description: 'Memory usage has been steadily climbing and is now at 92% on auth-service pod.', severity: 'high', icon: MemoryStick },
  { title: 'Disk Usage Warning', description: 'Disk usage on db-primary-01 has exceeded 85%.', severity: 'medium', icon: HardDrive },
  { title: 'SSL Certificate Expiring', description: 'SSL certificate for api.example.com will expire in 7 days.', severity: 'low', icon: Lock },
  { title: 'Response Time Degradation', description: 'Average response time 2s+ on the checkout service for the past 10 minutes.', severity: 'high', icon: Timer },
];

const SEV_COLORS = {
  critical: { bg: 'var(--color-red-dim)', text: 'var(--color-red)', border: 'rgba(239,68,68,0.2)' },
  high:     { bg: 'var(--color-amber-dim)', text: 'var(--color-amber)', border: 'rgba(245,158,11,0.2)' },
  medium:   { bg: 'var(--color-sky-dim)', text: 'var(--color-sky)', border: 'rgba(56,189,248,0.2)' },
  low:      { bg: 'rgba(100,116,139,0.1)', text: 'var(--color-text-muted)', border: 'rgba(100,116,139,0.2)' },
};

export default function AlertSimulation() {
  const [customAlert, setCustomAlert] = useState({ title: '', description: '', severity: 'high', assignedTo: null, assignedType: null });
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchSelectables = async () => {
      try {
        const [u, t] = await Promise.all([usersAPI.list(), teamsAPI.list()]);
        setUsers(u.data);
        setTeams(t.data);
      } catch (err) {
        console.error('Failed to load users/teams for assignment dropdown', err);
      }
    };
    fetchSelectables();
  }, []);

  const triggerTemplate = async (t) => {
    setSending(true);
    try {
      await alertsAPI.create({ title: t.title, description: t.description, severity: t.severity });
      toast.success(`"${t.title}" triggered`);
    } catch (err) {
      toast.error('Failed to trigger alert');
    } finally {
      setSending(false);
    }
  };

  const triggerCustom = async (e) => {
    e.preventDefault();
    if (!customAlert.title.trim()) return;
    setSending(true);
    try {
      await alertsAPI.create(customAlert);
      toast.success(`"${customAlert.title}" triggered`);
      setCustomAlert({ title: '', description: '', severity: 'high', assignedTo: null, assignedType: null });
    } catch (err) {
      toast.error('Failed to trigger alert');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer>
      {/* Quick triggers */}
      <div>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Quick Triggers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t, i) => {
            const Icon = t.icon;
            const sc = SEV_COLORS[t.severity];
            return (
              <button
                key={i}
                onClick={() => triggerTemplate(t)}
                disabled={sending}
                className="card text-left p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 disabled:opacity-50 group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold mb-1 transition-colors group-hover:text-[var(--color-text-primary)]"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {t.title}
                    </p>
                    <p
                      className="text-xs line-clamp-2 mb-2"
                      style={{ color: 'var(--color-text-dim)' }}
                    >
                      {t.description}
                    </p>
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                      style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
                    >
                      {t.severity}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom alert form */}
      <div className="card p-6">
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Custom Alert
        </h2>
        <form onSubmit={triggerCustom} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-dim)' }}
            >
              Title *
            </label>
            <input
              type="text"
              className="input-dark"
              placeholder="e.g., Database connection pool exhausted"
              value={customAlert.title}
              onChange={e => setCustomAlert({ ...customAlert, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-dim)' }}
            >
              Description
            </label>
            <textarea
              className="input-dark min-h-[80px] resize-y"
              placeholder="Detailed description of the incident..."
              value={customAlert.description}
              onChange={e => setCustomAlert({ ...customAlert, description: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-dim)' }}
            >
              Severity
            </label>
            <select
              className="select-dark w-full"
              value={customAlert.severity}
              onChange={e => setCustomAlert({ ...customAlert, severity: e.target.value })}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-dim)' }}
            >
              Assign To (Optional)
            </label>
            <select
              className="select-dark w-full"
              value={customAlert.assignedTo ? `${customAlert.assignedType}:${customAlert.assignedTo}` : ''}
              onChange={e => {
                const val = e.target.value;
                if (!val) {
                  setCustomAlert({ ...customAlert, assignedTo: null, assignedType: null });
                } else {
                  const [type, id] = val.split(':');
                  setCustomAlert({ ...customAlert, assignedTo: id, assignedType: type });
                }
              }}
            >
              <option value="">Auto-assign (via Rules)</option>
              {teams.length > 0 && <optgroup label="Teams">
                {teams.map(t => <option key={t._id} value={`team:${t._id}`}>{t.name}</option>)}
              </optgroup>}
              {users.length > 0 && <optgroup label="Users">
                {users.map(u => <option key={u._id} value={`user:${u._id}`}>{u.name}</option>)}
              </optgroup>}
            </select>
            <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-dim)' }}>
              Selecting an assignee will bypass automatic rule matching.
            </p>
          </div>
          <button
            type="submit"
            disabled={sending || !customAlert.title.trim()}
            className="btn btn-primary disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Triggering...' : 'Trigger Alert'}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
