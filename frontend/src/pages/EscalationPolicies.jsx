/**
 * Escalation Policies Page
 */

import { useState, useEffect } from 'react';
import { policiesAPI, usersAPI, teamsAPI } from '../api/client';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowRight, GitBranch } from 'lucide-react';

export default function EscalationPolicies() {
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', steps: [{ type: 'team', targetId: '', delay: 30 }] });

  const fetchData = async () => {
    try {
      const [p, u, t] = await Promise.all([policiesAPI.list(), usersAPI.list(), teamsAPI.list()]);
      setPolicies(p.data); setUsers(u.data); setTeams(t.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addStep = () => setForm({ ...form, steps: [...form.steps, { type: 'user', targetId: '', delay: 60 }] });
  const removeStep = (i) => setForm({ ...form, steps: form.steps.filter((_, idx) => idx !== i) });
  const updateStep = (i, field, value) => {
    const steps = [...form.steps];
    steps[i] = { ...steps[i], [field]: field === 'delay' ? parseInt(value) || 0 : value };
    if (field === 'type') steps[i].targetId = '';
    setForm({ ...form, steps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await policiesAPI.create(form);
      toast.success('Policy created');
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error('Failed to create policy'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this policy?')) return;
    try {
      await policiesAPI.delete(id);
      toast.success('Policy deleted');
      fetchData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const resolveTarget = (type, targetId) => {
    if (type === 'user') { const u = users.find(x => x._id === targetId); return u ? u.name : '—'; }
    const t = teams.find(x => x._id === targetId); return t ? t.name : '—';
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => { setForm({ name: '', steps: [{ type: 'team', targetId: '', delay: 30 }] }); setShowModal(true); }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-28 w-full" />)}
        </div>
      ) : policies.length === 0 ? (
        <div className="card py-16 text-center">
          <GitBranch className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-dim)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No escalation policies</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>Create a policy to auto-escalate unacknowledged alerts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => (
            <div key={policy._id} className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{policy.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{policy.steps.length} step(s)</p>
                </div>
                <button onClick={() => handleDelete(policy._id)} className="btn btn-sm btn-danger">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step chain visual */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {policy.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 shrink-0">
                    <div
                      className="rounded-xl px-4 py-3 min-w-[160px]"
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center"
                          style={{ background: 'var(--color-indigo-dim)', color: 'var(--color-indigo)' }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--color-text-dim)' }}>
                          {step.type}
                        </span>
                      </div>
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {resolveTarget(step.type, step.targetId)}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                        After {step.delay}s
                      </p>
                    </div>
                    {idx < policy.steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-dim)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Escalation Policy" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Policy Name</label>
            <input type="text" className="input-dark" placeholder="e.g., Critical Infrastructure" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-dim)' }}>Escalation Steps</label>
              <button type="button" onClick={addStep} className="btn btn-sm btn-ghost">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-2.5">
              {form.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <span
                    className="w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-indigo-dim)', color: 'var(--color-indigo)' }}
                  >
                    {idx + 1}
                  </span>
                  <select className="select-dark flex-1" value={step.type} onChange={e => updateStep(idx, 'type', e.target.value)}>
                    <option value="user">User</option>
                    <option value="team">Team</option>
                  </select>
                  <select className="select-dark flex-1" value={step.targetId} onChange={e => updateStep(idx, 'targetId', e.target.value)} required>
                    <option value="">Select...</option>
                    {step.type === 'user'
                      ? users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)
                      : teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)
                    }
                  </select>
                  <input type="number" className="input-dark w-20 text-center" value={step.delay} onChange={e => updateStep(idx, 'delay', e.target.value)} min="5" required />
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-dim)' }}>sec</span>
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors" style={{ color: 'var(--color-text-dim)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Policy</button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
