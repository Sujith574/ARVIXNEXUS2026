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
    <div className="flex-grow flex items-center justify-center section-py bg-slate-950">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="space-y-8 bg-slate-900/40 p-8 sm:p-10 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            {showOtpScreen ? (
              <ShieldCheck className="w-7 h-7 text-blue-400 animate-pulse" />
            ) : (
              <Landmark className="w-7 h-7 text-blue-400" />
            )}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {showOtpScreen ? 'Verify Email' : 'Register Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {showOtpScreen 
              ? `We have sent a verification code to ${email}`
              : 'Create an account to join or form teams, submit projects, and RSVP.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-900/50 text-rose-350 p-3.5 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-350 p-6 rounded-lg text-center space-y-2">
            <h3 className="font-bold text-lg">Verification Successful!</h3>
            <p className="text-sm text-slate-400">
              Your email has been verified. Redirecting to the Login portal...
            </p>
          </div>
        ) : showOtpScreen ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp-code" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  id="otp-code"
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-center tracking-[0.5em] text-xl font-bold placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
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
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-550 transition-all shadow-lg hover:shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
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
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullname" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="fullname"
                    name="name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-address" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-550 transition-all shadow-lg hover:shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
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
        </div>
      </div>
    </div>
  );
}
