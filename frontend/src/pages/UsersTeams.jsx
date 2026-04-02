import { useState, useEffect, useCallback } from 'react';
import { usersAPI, teamsAPI } from '../api/client';
import { RoleBadge } from '../components/Badge';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users as UsersIcon, UserPlus, Shield } from 'lucide-react';

export default function UsersTeams() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'responder' });
  const [teamForm, setTeamForm] = useState({ name: '', members: [] });
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'user'|'team', id, name }

  const fetchData = async () => {
    try {
      const [u, t] = await Promise.all([usersAPI.list(), teamsAPI.list()]);
      setUsers(u.data); setTeams(t.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.create(userForm);
      toast.success('User created');
      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: 'responder' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  };

  const deleteUser = async (id) => {
    try { await usersAPI.delete(id); toast.success('User deleted'); fetchData(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      await teamsAPI.create(teamForm);
      toast.success('Team created');
      setShowTeamModal(false);
      setTeamForm({ name: '', members: [] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create team');
    }
  };

  const deleteTeam = async (id) => {
    try { await teamsAPI.delete(id); toast.success('Team deleted'); fetchData(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);
    if (type === 'user') await deleteUser(id);
    else await deleteTeam(id);
  }, [confirmDelete]);

  const toggleMember = (uid) => {
    const members = teamForm.members.includes(uid) ? teamForm.members.filter(id => id !== uid) : [...teamForm.members, uid];
    setTeamForm({ ...teamForm, members });
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Users section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-indigo-dim)', color: 'var(--color-indigo)' }}
            >
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Users</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{users.length} user(s)</p>
            </div>
          </div>
          <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
        <div className="card overflow-hidden">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>No users yet</p>
            </div>
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'var(--color-indigo-dim)', color: 'var(--color-indigo)' }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <div className="flex justify-end">
                        <button onClick={() => setConfirmDelete({ type: 'user', id: u._id, name: u.name })} className="btn btn-sm btn-danger">
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
      </section>

      {/* Teams section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-green-dim)', color: 'var(--color-green)' }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Teams</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{teams.length} team(s)</p>
            </div>
          </div>
          <button onClick={() => { setTeamForm({ name: '', members: [] }); setShowTeamModal(true); }} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Create Team
          </button>
        </div>
        <div className="space-y-4">
          {teams.length === 0 ? (
            <div className="card py-12 text-center">
              <UsersIcon className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-dim)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>No teams yet</p>
            </div>
          ) : teams.map(team => (
            <div key={team._id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{team.name}</h3>
                <button onClick={() => setConfirmDelete({ type: 'team', id: team._id, name: team.name })} className="btn btn-sm btn-danger">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.members && team.members.length > 0 ? team.members.map(m => (
                  <span
                    key={m._id || m}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--color-bg)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-green)' }} />
                    {typeof m === 'object' ? m.name : m}
                  </span>
                )) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>No members</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Add User">
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Name</label>
            <input type="text" className="input-dark" placeholder="Full name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Email</label>
            <input type="email" className="input-dark" placeholder="user@example.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Role</label>
            <select className="select-dark w-full" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="responder">Responder</option>
              <option value="observer">Observer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Add User</button>
          </div>
        </form>
      </Modal>

      {/* Create Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Create Team">
        <form onSubmit={createTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Team Name</label>
            <input type="text" className="input-dark" placeholder="e.g., Platform Engineering" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-dim)' }}>Members</label>
            <div
              className="space-y-1 max-h-48 overflow-y-auto rounded-xl p-2"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {users.map(u => (
                <label
                  key={u._id}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[var(--color-surface-hover)]"
                >
                  <input
                    type="checkbox"
                    checked={teamForm.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    className="accent-[var(--color-indigo)] rounded"
                  />
                  <div className="min-w-0">
                    <span className="text-sm block" style={{ color: 'var(--color-text-primary)' }}>{u.name}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{u.email}</span>
                  </div>
                </label>
              ))}
              {users.length === 0 && <p className="text-xs p-2" style={{ color: 'var(--color-text-dim)' }}>Create users first</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTeamModal(false)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Team</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>{confirmDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setConfirmDelete(null)} className="btn btn-ghost">Cancel</button>
            <button type="button" onClick={handleConfirmDelete} className="btn btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
