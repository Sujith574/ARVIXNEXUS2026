'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, X, User, LogOut, Award, ShieldAlert, Calendar, BookOpen, MessageSquare, Trophy, Landmark } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const res = await fetch('/api/profile');
        if (res.ok) {
          const json = await res.json();
          setProfile(json.profile);
        }
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const res = await fetch('/api/profile');
          if (res.ok) {
            const json = await res.json();
            setProfile(json.profile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const role = profile?.role || 'participant';

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Government Emblem Placeholder */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:scale-105 transition-all duration-300">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Government of India</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-200">
                National Launch & Hackathon
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-blue-400 transition-colors py-2">
              Event Home
            </Link>
            <Link href="/hackathon/problems" className="text-sm font-medium hover:text-blue-400 transition-colors py-2">
              Problem Statements
            </Link>
            <Link href="/hackathon/leaderboard" className="text-sm font-medium hover:text-blue-400 transition-colors py-2 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
            </Link>
            <Link href="/event/press" className="text-sm font-medium hover:text-blue-400 transition-colors py-2">
              Press Kit
            </Link>

            {user && (
              <>
                <Link href="/hackathon/teams" className="text-sm font-medium hover:text-blue-400 transition-colors py-2">
                  My Team
                </Link>
                <Link href="/hackathon/submit" className="text-sm font-medium hover:text-blue-400 transition-colors py-2">
                  Project Submission
                </Link>
                <Link href="/hackathon/mentor-chat" className="text-sm font-medium hover:text-blue-400 transition-colors py-2 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-sky-400" /> Chat
                </Link>
              </>
            )}

            {/* Role-based Dashboards */}
            {user && (role === 'admin' || role === 'super_admin') && (
              <Link href="/admin" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 bg-rose-950/30 px-3 py-1.5 rounded-full border border-rose-900/50">
                <ShieldAlert className="w-4 h-4" /> Admin Console
              </Link>
            )}

            {user && role === 'judge' && (
              <Link href="/judge" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-900/50">
                <Award className="w-4 h-4" /> Judging Portal
              </Link>
            )}

            {/* VIP documents if available / assigned */}
            {user && (
              <Link href="/event/vip" className="text-sm font-medium hover:text-blue-400 transition-colors py-2">
                VIP Lounge
              </Link>
            )}
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/profile" className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-700">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span>{profile?.full_name || 'My Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-sm text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-950/30 px-3 py-2 rounded-lg transition-all border border-slate-800 hover:border-rose-900/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
            >
              Event Home
            </Link>
            <Link
              href="/hackathon/problems"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
            >
              Problem Statements
            </Link>
            <Link
              href="/hackathon/leaderboard"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
            >
              Leaderboard
            </Link>
            <Link
              href="/event/press"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
            >
              Press Kit
            </Link>

            {user && (
              <>
                <Link
                  href="/hackathon/teams"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
                >
                  My Team
                </Link>
                <Link
                  href="/hackathon/submit"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
                >
                  Project Submission
                </Link>
                <Link
                  href="/hackathon/mentor-chat"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
                >
                  Team Chat
                </Link>
                <Link
                  href="/event/vip"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-850 hover:text-blue-400"
                >
                  VIP Lounge
                </Link>
              </>
            )}

            {user && (role === 'admin' || role === 'super_admin') && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-slate-850"
              >
                Admin Console
              </Link>
            )}

            {user && role === 'judge' && (
              <Link
                href="/judge"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-slate-850"
              >
                Judging Portal
              </Link>
            )}
          </div>

          <div className="pt-4 pb-4 border-t border-slate-850 px-5">
            {user ? (
              <div className="space-y-3">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 text-slate-300 hover:text-white"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-355 font-bold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold">{profile?.full_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-rose-950/20 text-rose-400 border border-rose-900/50 py-2 rounded-lg font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center border border-slate-700 py-2 rounded-lg text-slate-300 font-medium hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
