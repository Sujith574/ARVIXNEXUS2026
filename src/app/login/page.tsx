'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Landmark, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center section-py bg-slate-950 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-[460px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-750 shadow-lg shadow-blue-500/20">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black tracking-tight text-white">
                Portal Access
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Sign in to access your hackathon teams, scorecards, or secure VIP itinerary.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/30 border border-rose-900/50 text-rose-350 p-4 rounded-xl text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email-address" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    placeholder="name@agency.gov.in"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Or</span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-2.5 py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.98] focus:outline-none"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <div className="text-center text-sm text-slate-400 pt-2">
            New user?{' '}
            <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
