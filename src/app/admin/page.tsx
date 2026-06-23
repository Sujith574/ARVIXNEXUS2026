'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, FileCode, CheckSquare, Calendar, Loader2, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    teams: 0,
    submissions: 0,
    rsvps: 0,
    checkins: 0,
  });
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, [supabase]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();

      setStats(data.stats || { users: 0, teams: 0, submissions: 0, rsvps: 0, checkins: 0 });
      setRecentAudits(data.recentAudits || []);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Registered Users', value: stats.users, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Hackathon Teams', value: stats.teams, icon: FileCode, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Submissions', value: stats.submissions, icon: CheckSquare, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Confirmed RSVPs', value: stats.rsvps, icon: Calendar, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Checked In', value: stats.checkins, icon: ShieldCheck, color: 'text-teal-400 bg-teal-500/10' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">System Dashboard</h2>
        <p className="text-slate-400 text-xs mt-1">Real-time statistics and server-side logs for the Launch Event and Hackathon.</p>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{card.label}</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent audits section */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-500" /> Recent Administrative Audit Logs
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Automated logging of mutations performed by dashboard operators.</p>
        </div>

        <div className="bg-slate-950/60 rounded-xl border border-slate-850 divide-y divide-slate-850 overflow-hidden">
          {recentAudits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-550 italic flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-655" />
              <span>No administrative actions recorded in the system audit log.</span>
            </div>
          ) : (
            recentAudits.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{log.profiles?.full_name || 'System Operator'}</span>
                    <span className="bg-slate-900 text-[10px] text-slate-500 border border-slate-800 py-0.5 px-2 rounded">
                      {log.profiles?.role || 'admin'}
                    </span>
                  </div>
                  <div className="text-slate-400 font-medium mt-1">{log.action}</div>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <div className="font-mono">{log.ip_address || '127.0.0.1'}</div>
                  <div className="mt-0.5">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
