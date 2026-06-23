'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Lock, Landmark, Loader2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // OTP States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to register.');
        setLoading(false);
      } else {
        setShowOtpScreen(true);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setOtpLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode.trim(),
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      alert('Verification code resent to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
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
              {showOtpScreen ? (
                <ShieldCheck className="w-7 h-7 text-white" />
              ) : (
                <Landmark className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black tracking-tight text-white">
                {showOtpScreen ? 'Verify Email' : 'Register'}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                {showOtpScreen 
                  ? `We have sent a verification code to ${email}`
                  : 'Create an account to join or form teams, submit projects, and RSVP.'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/30 border border-rose-900/50 text-rose-350 p-4 rounded-xl text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-6 rounded-2xl text-center space-y-2">
              <h3 className="font-bold text-base">Verification Successful!</h3>
              <p className="text-xs text-slate-400">
                Your email has been verified. Redirecting to the Login portal...
              </p>
            </div>
          ) : showOtpScreen ? (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="otp-code" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    6-Digit OTP Code
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center tracking-[0.5em] text-xl font-bold placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Signup
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullname" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="fullname"
                      name="name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

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
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="Create a strong password"
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
                    Registering...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center text-sm text-slate-400 pt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
