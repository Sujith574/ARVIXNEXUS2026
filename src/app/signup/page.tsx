'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Lock, Landmark, Loader2, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex-grow flex items-center justify-center section-py bg-bg-primary relative overflow-hidden min-h-[85vh]">
      {/* Decorative background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-secondary/4 rounded-full blur-[90px] animate-pulse" />
      </div>

      <div className="w-full max-w-[520px] mx-auto px-6 relative z-10">
        <div className="glass-card card-padding gradient-border-glow space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              {showOtpScreen ? (
                <ShieldCheck className="w-7 h-7 text-white" />
              ) : (
                <Landmark className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-white animate-fade-in">
                {showOtpScreen ? 'Security Code' : 'Create Account'}
              </h2>
              <p className="text-sm text-slate-455 leading-relaxed max-w-sm mx-auto">
                {showOtpScreen 
                  ? `Enter the 6-digit verification code sent to ${email}`
                  : 'Register your digital key to join teams, submit projects, and RSVP.'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-xs text-center font-bold">
              {errorMsg}
            </div>
          )}

          {success ? (
            <div className="bg-success/10 border border-success/20 text-success p-6 rounded-2xl text-center space-y-2.5">
              <h3 className="font-extrabold text-base">Verification Successful!</h3>
              <p className="text-xs text-slate-400">
                Your email has been verified. Redirecting to the Login portal...
              </p>
            </div>
          ) : showOtpScreen ? (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="space-y-6">
                <div className="flex flex-col">
                  <label htmlFor="otp-code" className="form-label text-center">
                    6-Digit OTP Code
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full h-[52px] bg-bg-primary border border-white/10 rounded-xl text-white text-center tracking-[0.6em] text-2xl font-bold placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="flex items-center gap-1.5 text-slate-450 hover:text-white font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Signup
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full h-[52px] flex justify-center items-center gap-2 px-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Verifying...</span>
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
              <div className="space-y-6">
                
                {/* Full Name */}
                <div className="flex flex-col">
                  <label htmlFor="fullname" className="form-label">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" />
                    </div>
                    <input
                      id="fullname"
                      name="name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email Address */}
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
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="Create a strong password"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] flex justify-center items-center gap-2 px-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Credentials Key</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center text-sm text-slate-450 pt-2 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline transition-colors">
              Sign in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
