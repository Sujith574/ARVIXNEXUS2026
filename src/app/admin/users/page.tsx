'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, ShieldAlert, Loader2, Award, UserCheck, RefreshCw } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role.');
      }

      const changedUser = users.find((u) => u.id === userId);
      setMsg({ type: 'success', text: `Role for ${changedUser?.full_name} updated to ${newRole}.` });
      await fetchUsers(); // Refresh list
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setUpdatingUserId(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">User Management</h2>
          <p className="text-slate-400 text-xs mt-1">Assign system roles, manage permissions, and update user accounts.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-white rounded-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg text-sm text-center border ${
          msg.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-355' 
            : 'bg-rose-950/30 border-rose-900/50 text-rose-350'
        }`}>
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
                  <th scope="col" className="px-6 py-4">Register Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Modify Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {user.full_name}
                          {user.avatar_url && (
                            <img src={user.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                          )}
                        </div>
                        <div className="text-slate-505 font-medium mt-0.5">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block py-0.5 px-2 rounded font-bold uppercase text-[9px] border ${
                        user.role === 'super_admin' || user.role === 'admin'
                          ? 'bg-rose-950/30 border-rose-900/50 text-rose-400'
                          : user.role === 'judge'
                          ? 'bg-amber-950/30 border-amber-900/50 text-amber-400'
                          : user.role === 'mentor'
                          ? 'bg-sky-950/30 border-sky-900/50 text-sky-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {updatingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="participant">Participant</option>
                            <option value="mentor">Mentor</option>
                            <option value="judge">Judge</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
