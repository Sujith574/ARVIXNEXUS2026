'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, RefreshCw, Plus, Edit2, Trash2, X, User, Mail, Shield, ShieldAlert, Check } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Add user form state
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'participant',
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit user form state
  const [editForm, setEditForm] = useState({
    userId: '',
    full_name: '',
    phone: '',
    github: '',
    linkedin: '',
    skills: '',
    avatar_url: '',
    is_speaker: false,
    organization: '',
    bio: '',
    role: 'participant',
  });
  const [editLoading, setEditLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user.');

      setMsg({ type: 'success', text: `User "${addForm.full_name}" registered successfully.` });
      setAddUserOpen(false);
      setAddForm({ full_name: '', email: '', password: '', role: 'participant' });
      await fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditOpen = (user: any) => {
    setEditingUser(user);
    setEditForm({
      userId: user.id,
      full_name: user.full_name || '',
      phone: user.phone || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      avatar_url: user.avatar_url || '',
      is_speaker: !!user.is_speaker,
      organization: user.organization || '',
      bio: user.bio || '',
      role: user.role || 'participant',
    });
    setEditUserOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user profile.');

      setMsg({ type: 'success', text: `Profile for "${editForm.full_name}" updated successfully.` });
      setEditUserOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete the user "${userName}"? This will permanently delete their Supabase auth credentials and database profile.`)) {
      return;
    }
    setMsg(null);

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user.');

      setMsg({ type: 'success', text: `User "${userName}" deleted successfully.` });
      await fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">User Management Control</h2>
          <p className="text-slate-400 text-xs mt-1">Assign roles, manage profiles, mark keynote speakers, and register/remove users.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setAddUserOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-white rounded-xl transition-all"
            aria-label="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg text-sm text-center border ${
            msg.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-350'
              : 'bg-rose-950/30 border-rose-900/50 text-rose-350'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
              <thead className="bg-slate-950/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4">User Details</th>
                  <th scope="col" className="px-6 py-4">Current Role</th>
                  <th scope="col" className="px-6 py-4">Keynote Speaker</th>
                  <th scope="col" className="px-6 py-4">Register Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/30 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 font-bold overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.full_name?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {user.full_name}
                            </div>
                            <div className="text-slate-500 font-medium mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block py-0.5 px-2 rounded font-bold uppercase text-[9px] border ${
                            user.role === 'super_admin' || user.role === 'admin'
                              ? 'bg-rose-950/30 border-rose-900/50 text-rose-400'
                              : user.role === 'judge'
                              ? 'bg-amber-950/30 border-amber-900/50 text-amber-400'
                              : user.role === 'mentor'
                              ? 'bg-sky-950/30 border-sky-900/50 text-sky-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_speaker ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 py-0.5 px-2 rounded font-bold">
                            <Check className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleEditOpen(user)}
                            className="p-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded border border-slate-800 transition"
                            title="Edit User Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            className="p-1.5 bg-slate-950 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded border border-slate-800 hover:border-rose-900 transition"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {addUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-6 p-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-400" /> Manual Account Registry
              </h3>
              <button onClick={() => setAddUserOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@meity.gov.in"
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  System Permission Role
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="participant">Participant</option>
                  <option value="mentor">Mentor</option>
                  <option value="judge">Judge</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-lg transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition text-xs cursor-pointer disabled:opacity-50"
                >
                  {addLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-500" /> Edit Profile Details
              </h3>
              <button onClick={() => setEditUserOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    GitHub Handle
                  </label>
                  <input
                    type="text"
                    value={editForm.github}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, github: e.target.value }))}
                    placeholder="e.g. rajeshkumar"
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    LinkedIn Handle
                  </label>
                  <input
                    type="text"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="e.g. in/rajeshkumar"
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="https://..."
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Skills (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.skills}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="AI, Next.js, CyberSecurity, Python"
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    System Permission Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="participant">Participant</option>
                    <option value="mentor">Mentor</option>
                    <option value="judge">Judge</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Speaker / Dignitary Toggle
                  </label>
                  <div className="flex items-center gap-3 mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg h-9">
                    <input
                      type="checkbox"
                      id="is_speaker"
                      checked={editForm.is_speaker}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, is_speaker: e.target.checked }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="is_speaker" className="text-slate-350 cursor-pointer font-medium select-none">
                      Mark as Dignitary/Speaker
                    </label>
                  </div>
                </div>

                {editForm.is_speaker && (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Speaker Organization
                      </label>
                      <input
                        type="text"
                        value={editForm.organization}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, organization: e.target.value }))}
                        placeholder="e.g. MeitY, Govt. of India"
                        required={editForm.is_speaker}
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Speaker Short Bio
                      </label>
                      <input
                        type="text"
                        value={editForm.bio}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="e.g. policymaker and technology advisor"
                        required={editForm.is_speaker}
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUserOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-lg transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition text-xs cursor-pointer disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
