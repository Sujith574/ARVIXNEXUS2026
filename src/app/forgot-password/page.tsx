'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Landmark, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      // Wait a moment and then redirect to reset-password page where they can enter OTP
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Landmark className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email address to receive a password reset OTP code.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-900/50 text-rose-350 p-3.5 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-350 p-6 rounded-lg text-center space-y-2">
            <h3 className="font-bold text-lg">Reset Email Sent!</h3>
            <p className="text-sm text-slate-400">
              An OTP code and reset link have been dispatched. Redirecting to reset portal...
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetRequest}>
            <div className="space-y-4">
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
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-550/50 focus:border-blue-500 transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-550 transition-all shadow-lg hover:shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Sending Code...
                </>
              ) : (
                <>
                  <span>Request Reset OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
