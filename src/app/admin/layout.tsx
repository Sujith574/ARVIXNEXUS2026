'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Users, FileCode, Calendar, ShieldCheck,
  Loader2, Menu, X, ChevronRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard Stats', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/hackathon', label: 'Hackathon Manager', icon: FileCode },
  { href: '/admin/event', label: 'Event Manager', icon: Calendar },
  { href: '/admin/audit', label: 'System Audit Logs', icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => { closeSidebar(); }, [pathname, closeSidebar]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const res = await fetch('/api/profile');
      if (!res.ok) { router.push('/'); return; }
      const { profile: prof } = await res.json();

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
      <div className="flex-grow flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-slate-500 text-sm font-medium">Verifying permissions…</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-black text-rose-300 bg-rose-950/50 border border-rose-800/50 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Super Admin
          </span>
        </div>
        <h2 className="text-base font-black text-white tracking-tight">Control Room</h2>
        {profile && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{profile.email || profile.full_name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Management</p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30 shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-500" />}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-800/60">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Quick Access</p>
          <Link
            href="/event/checkin"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 border border-dashed border-slate-700/60 hover:border-slate-600/60 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>Gate Check-in Scanner</span>
          </Link>
        </div>
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <Link
          href="/"
          onClick={closeSidebar}
          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 rounded-xl transition-all"
        >
          ← Back to Public Site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex-grow bg-slate-950 flex flex-col min-h-screen">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
        <div>
          <span className="text-[9px] font-black text-rose-300 bg-rose-950/50 border border-rose-800/50 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Admin
          </span>
          <h2 className="text-sm font-bold text-white mt-0.5">Control Room</h2>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-all"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{sidebarOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      <div className="flex flex-1 relative">

        {/* ── Mobile Sidebar Drawer ── */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 md:hidden
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ top: '0' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <span className="text-sm font-bold text-white">Admin Panel</span>
            <button onClick={closeSidebar} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <SidebarContent />
        </div>

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-slate-900/30 border-r border-slate-800/60 flex-shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-hidden">
          <SidebarContent />
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 xl:p-10 overflow-x-hidden min-w-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
