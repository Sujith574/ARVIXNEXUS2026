'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Users, FileCode, Calendar, ShieldCheck, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const profRes = await fetch('/api/profile');
      if (!profRes.ok) {
        router.push('/');
        return;
      }
      const profJson = await profRes.json();
      const prof = profJson.profile;

      if (!prof || (prof.role !== 'admin' && prof.role !== 'super_admin')) {
        router.push('/');
        return;
      }

      setProfile(prof);
      setLoading(false);
    };

    checkAdmin();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-950 flex flex-col md:flex-row min-h-[85vh]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/30 border-b md:border-b-0 md:border-r border-slate-850 p-6 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2 py-0.5 rounded uppercase tracking-wider">
            SuperAdmin Suite
          </span>
          <h2 className="text-lg font-bold text-white mt-2">Control Room</h2>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard Stats</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>User Management</span>
          </Link>

          <Link
            href="/admin/hackathon"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Hackathon Manager</span>
          </Link>

          <Link
            href="/admin/event"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Launch Event Manager</span>
          </Link>

          <Link
            href="/admin/audit"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>System Audit Logs</span>
          </Link>

          <Link
            href="/event/checkin"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg transition-all mt-4"
          >
            <span>Launch Gate Checkin</span>
          </Link>
        </nav>
      </aside>

      {/* Main Work Area */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
