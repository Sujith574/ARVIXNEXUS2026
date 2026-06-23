'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Landmark, ArrowLeft, ShieldCheck, Ticket, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RSVPPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmed ticket details
  const [rsvpTicket, setRsvpTicket] = useState<any>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setInviteDetails(null);

    try {
      const response = await fetch(`/api/event/rsvp?code=${code.trim().toUpperCase()}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        setErrorMsg(data.error || 'Verification failed.');
      } else if (data.valid) {
        setInviteDetails(data);
        setFullName(data.invitee_name);
        setEmail(data.email);
      }
    } catch (err) {
      setErrorMsg('Network error verifying code.');
    }
    setLoading(false);
  };

  const handleConfirmRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/event/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: fullName,
          email,
          phone,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setErrorMsg(data.error || 'Failed to submit RSVP.');
      } else if (data.success) {
        setRsvpTicket(data.rsvp);
      }
    } catch (err) {
      setErrorMsg('Network error submitting RSVP.');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex-grow bg-slate-950 section-py">
      <div className="w-full max-w-xl mx-auto px-6 space-y-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-900/50 text-rose-350 p-3.5 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {rsvpTicket ? (
          /* RSVP Confirmed: Show Ticket */
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6">
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-6 text-center border-b border-slate-800 space-y-2">
              <div className="mx-auto flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">e-Ticket Generated</h3>
              <p className="text-xs text-slate-400">Please present this QR code at the registration desk for check-in.</p>
            </div>

            <div className="p-8 flex flex-col items-center space-y-6">
              
              {/* QR Code */}
              <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-slate-800">
                <QRCodeSVG value={rsvpTicket.qr_code_data} size={180} level="H" />
              </div>

              {/* Ticket Details */}
              <div className="w-full bg-slate-950/60 border border-slate-850 p-5 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <span className="text-slate-500 font-semibold">TICKET ID</span>
                  <span className="font-mono font-bold text-white">{rsvpTicket.qr_code_data}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Attendee</span>
                  <span className="font-bold text-white">{rsvpTicket.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email</span>
                  <span className="text-white">{rsvpTicket.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Access Tier</span>
                  <span className="font-semibold text-blue-450 uppercase bg-blue-950/45 px-2 py-0.5 rounded border border-blue-900/30 text-xs">
                    {inviteDetails?.type || 'Delegate'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-505 bg-slate-950 p-2.5 rounded-lg border border-slate-850 w-full justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified by Ministry e-Registry Systems</span>
              </div>
            </div>
          </div>
        ) : !inviteDetails ? (
          /* Step 1: Input Invite Code */
          <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Event RSVP Verification</h3>
              <p className="text-slate-400 text-sm mt-1">
                Enter your unique invitation code to unlock your personalized registration ticket.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Invitation Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP777"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase tracking-widest font-mono font-bold"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Invitation</span>}
              </button>
            </form>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2 text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block">Evaluation Demo Codes:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li><span className="font-mono text-blue-400 font-bold">VIP777</span> - VIP Guest credentials</li>
                <li><span className="font-mono text-blue-400 font-bold">PRESS888</span> - Press & Media credentials</li>
                <li><span className="font-mono text-blue-400 font-bold">GUEST999</span> - General Public credentials</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Step 2: Confirm RSVPs details */
          <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-400" /> Confirm Attendance
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                You have unlocked a <span className="text-blue-400 font-bold uppercase">{inviteDetails.type}</span> tier invitation. Verify details to complete RSVP.
              </p>
            </div>

            <form onSubmit={handleConfirmRSVP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setInviteDetails(null)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm RSVP</span>}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
