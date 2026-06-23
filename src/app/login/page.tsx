'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Landmark, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex-grow flex items-center justify-center section-py bg-bg-primary relative overflow-hidden min-h-[80vh]">
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-secondary/4 rounded-full blur-[90px] animate-pulse" />
      </div>

      <div className="w-full max-w-[520px] mx-auto px-6 relative z-10">
        <div className="glass-card card-padding gradient-border-glow space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Portal Sign In
              </h2>
              <p className="text-sm text-slate-450 leading-relaxed">
                Access your hackathon teams, submissions, or secure VIP itineraries.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-xs text-center font-bold">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-6">
              
              {/* Email Field */}
              <div className="flex flex-col">
                <label htmlFor="email-address" className="form-label">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="name@agency.gov.in"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline transition-colors mb-2">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] flex justify-center items-center gap-2 px-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-sm text-slate-450 pt-2 font-medium">
            New user?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline transition-colors">
              Create registration key
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
