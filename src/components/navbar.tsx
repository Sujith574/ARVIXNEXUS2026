'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Menu, X, User, LogOut, Award, ShieldAlert, MessageSquare,
  Trophy, Landmark, ChevronRight, Home, FileText, Ticket, Star
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
      className={`relative inline-flex items-center px-4.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive
          ? 'text-blue-400 bg-blue-500/8'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        } ${className}`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-4.5 right-4.5 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Scroll effect for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
    { href: '/hackathon/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/event/rsvp', label: 'RSVP', icon: Ticket },
  ];

  const authLinks = user ? [
    { href: '/hackathon/teams', label: 'My Team', icon: Star },
    { href: '/hackathon/submit', label: 'Submit', icon: ChevronRight },
    { href: '/hackathon/mentor-chat', label: 'Chat', icon: MessageSquare },
  ] : [];

  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-slate-800/80'
            : 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50'
          }`}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3 group flex-shrink-0"
              onClick={closeMenu}
            >
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Landmark className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-blue-400 font-semibold leading-none">
                    Govt. of India
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                </div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight group-hover:text-blue-300 transition-colors duration-200">
                  <span className="hidden sm:inline">National Launch & </span>Hackathon
                </h1>
              </div>
              {/* Mobile logo text */}
              <span className="block xs:hidden text-sm font-bold text-white">ARVIX 2026</span>
            </Link>

            {/* ── Desktop Navigation ── */}
            <div className="hidden lg:flex items-center gap-3">
              {publicLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} isActive={pathname === href}>
                  {label}
                </NavLink>
              ))}

              {user && authLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} isActive={pathname === href}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* ── Desktop Auth / Actions ── */}
            <div className="hidden lg:flex items-center gap-5">
              {/* Role-based pills */}
              {user && isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/50 hover:border-rose-700/70 rounded-full transition-all duration-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
              )}
              {user && isJudge && (
                <Link
                  href="/judge"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-800/50 hover:border-amber-700/70 rounded-full transition-all duration-200"
                >
                  <Award className="w-3.5 h-3.5" />
                  Judging
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600/70 rounded-lg transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {userInitial}
                    </div>
                    <span className="max-w-[120px] truncate text-xs font-medium">
                      {profile?.full_name || 'Profile'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-950/30 border border-slate-700/40 hover:border-rose-800/50 rounded-lg transition-all duration-200"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg bg-slate-900/40 hover:bg-slate-850/60 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {userInitial}
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-700/40 hover:border-slate-600/60 transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 sm:w-80 bg-slate-950 border-l border-slate-800 shadow-2xl lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">ARVIX 2026</span>
          </div>
          <button
            onClick={closeMenu}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex flex-col h-full overflow-y-auto pb-20">

          {/* User info */}
          {user && (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 mx-4 mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.full_name || 'My Profile'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 ml-auto" />
            </Link>
          )}

          {/* Navigation Links */}
          <div className="px-4 mt-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 mb-2">Navigation</p>
            {publicLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${pathname === href
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}

            {user && authLinks.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 mb-2 mt-4">My Workspace</p>
                {authLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${pathname === href
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </>
            )}

            {/* Role-based links */}
            {user && isAdmin && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 mb-2 mt-4">Administration</p>
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/40 transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Console
                </Link>
              </>
            )}

            {user && isJudge && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 mb-2 mt-4">Judging</p>
                <Link
                  href="/judge"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 bg-amber-950/20 border border-amber-900/30 hover:bg-amber-950/40 transition-all"
                >
                  <Award className="w-4 h-4" />
                  Judging Portal
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="px-4 mt-auto pt-6 pb-6 border-t border-slate-800 mt-6 space-y-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-900/40 hover:border-rose-800/60 rounded-xl text-sm font-semibold transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl text-sm font-medium transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
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
