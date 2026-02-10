import { useEffect, useState } from 'react';
import { Users, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { signUpWithEmail } from '../../services/authService';

const ROLES = ['driver', 'operator', 'officer', 'admin'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver',
    status: 'Active',
  });

  // Load users from Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsers(list);
      } catch (e) {
        console.error('Error loading users', e);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const openAddForm = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'driver',
      status: 'Active',
    });
    setIsFormOpen(true);
    setError(null);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'driver',
      status: user.status || 'Active',
    });
    setIsFormOpen(true);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Create or update a user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Update Firestore doc (role / status / name)
        const ref = doc(db, 'users', editingUser.id);
        await updateDoc(ref, {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
        });

        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, name: form.name, email: form.email, role: form.role, status: form.status }
              : u,
          ),
        );
      } else {
        // Create auth user + Firestore doc
        const { success, user, error: signUpError } = await signUpWithEmail(
          form.email,
          form.password,
          form.role,
        );

        if (!success) {
          throw new Error(signUpError || 'Failed to create user');
        }

        const now = serverTimestamp();
        const ref = await addDoc(collection(db, 'users'), {
          uid: user.uid,
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          createdAt: now,
          lastActive: now,
        });

        setUsers((prev) => [
          ...prev,
          {
            id: ref.id,
            uid: user.uid,
            name: form.name,
            email: form.email,
            role: form.role,
            status: form.status,
          },
        ]);
      }

      setIsFormOpen(false);
    } catch (e) {
      console.error('Error saving user', e);
      setError(e.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user record? This cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error('Error deleting user', e);
      setError('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-purple-500" />
          User Management
        </h2>
        <button
          onClick={openAddForm}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          + Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#1E293B] rounded-2xl border border-white/5 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#0B1120] text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-bold text-white">
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name || '—'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.role === 'admin' && <Shield size={14} className="text-purple-400" />}
                        {user.role === 'operator' && <UserCheck size={14} className="text-blue-400" />}
                        <span
                          className={
                            user.role === 'admin'
                              ? 'text-purple-400'
                              : user.role === 'operator'
                                ? 'text-blue-400'
                                : user.role === 'officer'
                                  ? 'text-orange-400'
                                  : 'text-gray-300'
                          }
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${user.status === 'Active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : user.status === 'On Duty'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                      >
                        {user.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {user.lastActive
                        ? new Date(user.lastActive.seconds * 1000).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(user)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over form panel */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0B1120] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {editingUser
                ? 'Update role, status or profile information.'
                : 'Create a new account and assign a role.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:bg-slate-900/50 disabled:text-slate-100 disabled:opacity-100 disabled:cursor-not-allowed"
                  required
                  disabled={!!editingUser}
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Share this with the user; they can change it after first login.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="On Duty">On Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
