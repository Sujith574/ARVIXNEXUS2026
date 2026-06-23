'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Menu, X, User, LogOut, Award, ShieldAlert, MessageSquare,
  Trophy, Landmark, ChevronRight, Home, FileText, Ticket, Star, Clock, Users
} from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

function NavLink({ href, children, onClick, className = '', isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
        ${isActive
          ? 'text-primary bg-primary/10 border border-primary/20'
          : 'text-slate-350 hover:text-white hover:bg-slate-800/40'
        } ${className}`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1.5 left-4 right-4 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_1px_6px_rgba(79,124,255,0.6)]" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    header_logo_label: 'Govt. of India',
    header_logo_title: 'National Hackathon Platform',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setBrandSettings({
            header_logo_label: data.header_logo_label || 'Govt. of India',
            header_logo_title: data.header_logo_title || 'National Hackathon Platform',
          });
        }
      } catch (err) {
        console.error('Error loading brand settings in Navbar:', err);
      }
    };
    fetchSettings();
  }, []);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          try {
            const res = await fetch('/api/profile');
            if (res.ok) {
              const json = await res.json();
              setProfile(json.profile);
            }
          } catch (profileErr) {
            console.error('Error fetching profile:', profileErr);
          }
        }
      } catch (sessionErr) {
        console.error('Error getting session:', sessionErr);
      }
    };

    fetchSession();

    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            if (session?.user) {
              setUser(session.user);
              try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                  const json = await res.json();
                  setProfile(json.profile);
                }
              } catch (profileErr) {
                console.error('Error fetching profile in auth change:', profileErr);
              }
            } else {
              setUser(null);
              setProfile(null);
            }
          } catch (authErr) {
            console.error('Error in onAuthStateChange callback:', authErr);
          }
        }
      );
      subscription = data?.subscription;
    } catch (err) {
      console.error('Error setting up onAuthStateChange:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const handleLogout = async () => {
    closeMenu();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const role = profile?.role || 'participant';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isJudge = role === 'judge';

  const publicLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/hackathon/problems', label: 'Problems', icon: FileText },
    { href: '/#timeline', label: 'Timeline', icon: Clock },
    { href: '/#speakers', label: 'Speakers', icon: Users },
    { href: '/hackathon/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/event/rsvp', label: 'RSVP', icon: Ticket },
  ];

  const authLinks = user ? [
    { href: '/hackathon/teams', label: 'My Team', icon: Star },
    { href: '/hackathon/submit', label: 'Submit', icon: ChevronRight },
    { href: '/hackathon/mentor-chat', label: 'Chat', icon: MessageSquare },
  ] : [];

  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  // Helper to check active state including hash links
  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      return false; // Let browser standard anchor handling apply
    }
    return pathname === href;
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 w-full
          ${scrolled
            ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-3'
            : 'bg-bg-primary/40 backdrop-blur-md border-b border-white/5 py-5'
          }`}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3.5 group flex-shrink-0"
              onClick={closeMenu}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 group-hover:scale-[1.04] transition-all duration-300">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold leading-none">
                    {brandSettings.header_logo_label}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
                </div>
                <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight mt-0.5 group-hover:text-primary transition-colors duration-300">
                  {brandSettings.header_logo_title}
                </h1>
              </div>
              {/* Mobile logo text */}
              <span className="block sm:hidden text-base font-extrabold text-white tracking-tight">ARVIX NEXUS</span>
            </Link>

            {/* ── Desktop Navigation ── */}
            <div className="hidden lg:flex items-center gap-1.5">
              {publicLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} isActive={isLinkActive(href)}>
                  {label}
                </NavLink>
              ))}

              {user && authLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} isActive={isLinkActive(href)}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* ── Desktop Auth / Actions ── */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Role-based pills */}
              {user && isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 rounded-xl transition-all duration-300"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
              {user && isJudge && (
                <Link
                  href="/judge"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-warning bg-warning/10 hover:bg-warning/20 border border-warning/20 rounded-xl transition-all duration-300"
                >
                  <Award className="w-4 h-4" />
                  Judging
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-350 hover:text-white bg-slate-800/40 hover:bg-slate-850/60 border border-white/5 rounded-xl transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {userInitial}
                    </div>
                    <span className="max-w-[120px] truncate text-xs font-semibold">
                      {profile?.full_name || 'Profile'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-danger bg-slate-800/30 hover:bg-danger/10 border border-white/5 hover:border-danger/20 rounded-xl transition-all duration-300"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl bg-slate-900/40 hover:bg-slate-850/60 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 hover:scale-[1.02] rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="flex lg:hidden items-center gap-3">
              {user && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {userInitial}
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-white/5 hover:border-white/15 transition-all duration-300"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>
      )}

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 sm:w-80 bg-surface border-l border-white/5 shadow-2xl lg:hidden
          transform transition-transform duration-350 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Landmark className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">ARVIX NEXUS</span>
          </div>
          <button
            onClick={closeMenu}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-450 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex flex-col h-full overflow-y-auto pb-24">

          {/* User info */}
          {user && (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3.5 mx-5 mt-5 p-3.5 bg-bg-primary/60 border border-white/5 rounded-xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {profile?.full_name || 'My Profile'}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 ml-auto" />
            </Link>
          )}

          {/* Navigation Links */}
          <div className="px-5 mt-6 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2.5">Navigation</p>
            {publicLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${pathname === href
                    ? 'bg-primary/10 text-primary border border-primary/25'
                    : 'text-slate-350 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {label}
              </Link>
            ))}

            {user && authLinks.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2.5 mt-5">My Workspace</p>
                {authLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${pathname === href
                        ? 'bg-primary/10 text-primary border border-primary/25'
                        : 'text-slate-350 hover:text-white hover:bg-slate-800/60'
                      }`}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </>
            )}

            {/* Role-based links */}
            {user && isAdmin && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2.5 mt-5">Administration</p>
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold text-danger bg-danger/10 border border-danger/25 hover:bg-danger/20 transition-all"
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                  Admin Console
                </Link>
              </>
            )}

            {user && isJudge && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2.5 mt-5">Judging</p>
                <Link
                  href="/judge"
                  onClick={closeMenu}
                  className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold text-warning bg-warning/10 border border-warning/25 hover:bg-warning/20 transition-all"
                >
                  <Award className="w-4.5 h-4.5" />
                  Judging Portal
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="px-5 mt-auto pt-6 border-t border-white/5 mt-6 space-y-2.5">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-xl text-sm font-bold transition-all duration-300"
              >
                <LogOut className="w-4.5 h-4.5" />
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-3 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl text-sm font-semibold transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
