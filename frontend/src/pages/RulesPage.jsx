/**
 * Rules Page — CRUD for alert routing rules
 */

import { useState, useEffect } from 'react';
import { rulesAPI, teamsAPI } from '../api/client';
import { SeverityBadge } from '../components/Badge';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Code2 } from 'lucide-react';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState({ condition: '', severity: 'high', teamId: '' });

  const fetchData = async () => {
    try {
      const [r, t] = await Promise.all([rulesAPI.list(), teamsAPI.list()]);
      setRules(r.data);
      setTeams(t.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingRule(null);
    setForm({ condition: '', severity: 'high', teamId: teams[0]?._id || '' });
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      condition: rule.condition,
      severity: rule.severity,
      teamId: typeof rule.teamId === 'object' ? rule.teamId._id : rule.teamId,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await rulesAPI.update(editingRule._id, form);
        toast.success('Rule updated');
      } else {
        await rulesAPI.create(form);
        toast.success('Rule created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save rule');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await rulesAPI.delete(id);
      toast.success('Rule deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getTeamName = (teamId) => {
    if (typeof teamId === 'object' && teamId?.name) return teamId.name;
    const t = teams.find(x => x._id === teamId);
    return t?.name || '—';
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div />
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center">
            <Code2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-dim)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No routing rules defined
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
              Create a rule to route alerts to teams
            </p>
          </div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Condition</th>
                <th>Severity</th>
                <th>Target Team</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule._id}>
                  <td>
                    <code
                      className="text-sm px-2 py-1 rounded-lg"
                      style={{
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {rule.condition}
                    </code>
                  </td>
                  <td><SeverityBadge severity={rule.severity} /></td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{getTeamName(rule.teamId)}</td>
                  <td style={{ color: 'var(--color-text-dim)' }}>
                    {new Date(rule.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(rule)} className="btn btn-sm btn-ghost">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(rule._id)} className="btn btn-sm btn-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRule ? 'Edit Rule' : 'Create Rule'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Condition</label>
            <input type="text" className="input-dark" placeholder="e.g., CPU > 80%" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Severity</label>
            <select className="select-dark w-full" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Target Team</label>
            <select className="select-dark w-full" value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })} required>
              <option value="">Select team...</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">{editingRule ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
