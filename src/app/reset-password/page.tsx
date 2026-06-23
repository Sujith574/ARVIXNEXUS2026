'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Landmark, Loader2, ArrowRight, ArrowLeft, Key } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otpCode.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verify the recovery OTP (this signs the user in temporarily)
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'recovery',
      });

      if (otpError) {
        throw new Error(otpError.message || 'OTP verification failed. Please check the code.');
      }

      // 2. Update the password for the active session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password.');
      }

      // 3. Sign out to clear the session so they must log in with the new password
      await supabase.auth.signOut();

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during password reset.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
      
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <Key className="w-7 h-7 text-blue-400" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your recovery OTP code and choose a new password.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/30 border border-rose-900/50 text-rose-350 p-3.5 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}

      {success ? (
        <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-350 p-6 rounded-lg text-center space-y-2">
          <h3 className="font-bold text-lg">Password Reset Success!</h3>
          <p className="text-sm text-slate-400">
            Your password has been successfully updated. Redirecting to login...
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-550/50 focus:border-blue-550 transition-all text-sm"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="otp-token" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                6-Digit Recovery OTP
              </label>
              <input
                id="otp-token"
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-550/50 focus:border-blue-550 transition-all text-sm"
                placeholder="000000"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-550/50 focus:border-blue-550 transition-all text-sm"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-550/50 focus:border-blue-550 transition-all text-sm"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <Link
              href="/forgot-password"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Request a new code
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !otpCode || !password}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-550 transition-all shadow-lg hover:shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Resetting Password...
              </>
            ) : (
              <>
                <span>Change Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-slate-950">
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
