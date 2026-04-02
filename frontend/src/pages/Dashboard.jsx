/**
 * Dashboard — Alert monitoring with stat cards, search, filterable table, timeline
 */

import { useState, useEffect, useCallback } from 'react';
import { alertsAPI, usersAPI, teamsAPI } from '../api/client';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import StatCard from '../components/StatCard';
import PageContainer from '../components/PageContainer';
import toast from 'react-hot-toast';
import React from 'react';
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Search,
  RotateCw,
  ChevronDown,
  Clock,
  User,
} from 'lucide-react';

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [logs, setLogs] = useState([]);

  // Reference data for name resolution
  useEffect(() => {
    (async () => {
      try {
        const [u, t] = await Promise.all([usersAPI.list(), teamsAPI.list()]);
        setUsers(u.data);
        setTeams(t.data);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const params = {};
      if (filterSeverity) params.severity = filterSeverity;
      if (filterStatus) params.status = filterStatus;
      const { data } = await alertsAPI.list(params);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filterSeverity, filterStatus]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const toggleLogs = async (alertId) => {
    if (expandedAlert === alertId) {
      setExpandedAlert(null);
      setLogs([]);
      return;
    }
    try {
      const { data } = await alertsAPI.logs(alertId);
      setLogs(data);
      setExpandedAlert(alertId);
    } catch (err) { console.error(err); }
  };

  const handleAcknowledge = async (id) => {
    try {
      await alertsAPI.acknowledge(id);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to acknowledge');
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertsAPI.resolve(id);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to resolve');
    }
  };

  const resolveAssignee = (alert) => {
    if (!alert.assignedTo) return null;
    if (alert.assignedType === 'user') {
      const u = users.find(x => x._id === alert.assignedTo);
      return u ? u.name : null;
    }
    if (alert.assignedType === 'team') {
      const t = teams.find(x => x._id === alert.assignedTo);
      return t ? t.name : null;
    }
    const u = users.find(x => x._id === alert.assignedTo);
    if (u) return u.name;
    const t = teams.find(x => x._id === alert.assignedTo);
    if (t) return t.name;
    return null;
  };

  // Filter by search query
  const filteredAlerts = alerts.filter(a =>
    !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: alerts.length,
    triggered: alerts.filter(a => a.status === 'triggered').length,
    escalated: alerts.filter(a => a.status === 'escalated').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTimeWithSeconds = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <PageContainer>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Alerts" value={stats.total} icon={Bell} color="indigo" />
        <StatCard label="Triggered" value={stats.triggered} icon={AlertTriangle} color="red" />
        <StatCard label="Escalated" value={stats.escalated} icon={TrendingUp} color="amber" />
        <StatCard label="Acknowledged" value={stats.acknowledged} icon={CheckCircle2} color="sky" />
        <StatCard label="Resolved" value={stats.resolved} icon={ShieldCheck} color="green" />
      </div>

      {/* Filters + search bar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-text-dim)' }}
            />
            <input
              type="text"
              className="input-dark pl-10"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Severity filter */}
          <select
            className="select-dark"
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status filter */}
          <select
            className="select-dark"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="triggered">Triggered</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Auto-refresh indicator */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'var(--color-indigo-subtle)', color: 'var(--color-text-muted)' }}
          >
            <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            Auto-refresh
          </div>
        </div>
      </div>

      {/* Alert table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-dim)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No alerts found
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
              Go to Simulate to trigger a test alert
            </p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Alert</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => (
                <React.Fragment key={alert._id}>
                  <tr key={alert._id} className="group">
                    <td>
                      <button
                        onClick={() => toggleLogs(alert._id)}
                        className="text-left w-full"
                      >
                        <p
                          className="text-sm font-medium transition-colors group-hover:text-[var(--color-indigo-hover)]"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {alert.title}
                        </p>
                        {alert.description && (
                          <p
                            className="text-xs mt-0.5 max-w-sm truncate"
                            style={{ color: 'var(--color-text-dim)' }}
                          >
                            {alert.description}
                          </p>
                        )}
                      </button>
                    </td>
                    <td><SeverityBadge severity={alert.severity} /></td>
                    <td><StatusBadge status={alert.status} /></td>
                    <td>
                      {resolveAssignee(alert) ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <User className="w-3.5 h-3.5" />
                          {resolveAssignee(alert)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm"
                        style={{ color: 'var(--color-text-dim)' }}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(alert.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        {(alert.status === 'triggered' || alert.status === 'escalated') && (
                          <>
                            <button
                              onClick={() => handleAcknowledge(alert._id)}
                              className="btn btn-sm btn-ghost"
                            >
                              Ack
                            </button>
                            <button
                              onClick={() => handleResolve(alert._id)}
                              className="btn btn-sm btn-success"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            onClick={() => handleResolve(alert._id)}
                            className="btn btn-sm btn-success"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => toggleLogs(alert._id)}
                          className="btn btn-sm btn-ghost"
                          title="View timeline"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${expandedAlert === alert._id ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded timeline */}
                  {expandedAlert === alert._id && (
                    <tr key={`${alert._id}-logs`}>
                      <td colSpan={6} className="!p-0">
                        <div
                          className="px-6 py-5 border-t"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <p
                            className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                            style={{ color: 'var(--color-text-dim)' }}
                          >
                            Timeline
                          </p>
                          {logs.length === 0 ? (
                            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                              No events recorded
                            </p>
                          ) : (
                            <div className="space-y-2.5">
                              {logs.map(log => (
                                <div key={log._id} className="flex items-start gap-3 text-sm">
                                  <span
                                    className="text-xs whitespace-nowrap mt-0.5 tabular-nums"
                                    style={{ color: 'var(--color-text-dim)' }}
                                  >
                                    {formatTimeWithSeconds(log.timestamp)}
                                  </span>
                                  <span
                                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                    style={{ background: 'var(--color-indigo)' }}
                                  />
                                  <span style={{ color: 'var(--color-text-secondary)' }}>
                                    {log.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
}
