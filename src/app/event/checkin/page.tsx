'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Camera, CheckCircle, ShieldAlert, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckinPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scannerResult, setScannerResult] = useState<any>(null);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);

  const scannerRef = useRef<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfileAndStats();
    
    // Initialize html5-qrcode dynamically on client-side
    let html5QrcodeScanner: any = null;
    import('html5-qrcode').then((module) => {
      html5QrcodeScanner = new module.Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      html5QrcodeScanner.render(
        async (decodedText: string) => {
          // Prevent multiple requests on continuous scans
          handleCheckInCode(decodedText);
        },
        (error: any) => {
          // Verbose error logging ignored
        }
      );
    });

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((err: any) => console.error('Error clearing scanner', err));
      }
    };
  }, [supabase, router]);

  const fetchProfileAndStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Get profile from MongoDB API
      const profRes = await fetch('/api/profile');
      if (!profRes.ok) throw new Error('Failed to fetch profile');
      const profJson = await profRes.json();
      const prof = profJson.profile;

      if (!prof || (prof.role !== 'admin' && prof.role !== 'super_admin')) {
        router.push('/');
        return;
      }
      setProfile(prof);

      // 2. Fetch check-in stats and recents from API
      const checkinRes = await fetch('/api/event/checkin');
      if (!checkinRes.ok) throw new Error('Failed to fetch checkin data');
      const checkinJson = await checkinRes.json();

      setTotalCount(checkinJson.totalCount || 0);
      setCheckinCount(checkinJson.checkinCount || 0);
      setRecentCheckins(checkinJson.recentCheckins || []);
    } catch (err) {
      console.error('Error loading check-in terminal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInCode = async (ticketCode: string) => {
    setSubmitting(true);
    setScannerResult(null);

    try {
      const res = await fetch('/api/event/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: ticketCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScannerResult({ success: false, text: data.error || 'Check-in failed.' });
        return;
      }

      if (data.alreadyCheckedIn) {
        setScannerResult({
          success: false,
          text: `Guest has already checked in at ${new Date(data.checkin_time).toLocaleTimeString()}`,
          name: data.name,
        });
      } else {
        setScannerResult({
          success: true,
          text: 'Attendee successfully checked in!',
          name: data.rsvp.name,
          time: new Date(data.rsvp.checkin_time).toLocaleTimeString(),
        });
        
        // Refresh statistics
        await fetchProfileAndStats();
      }
    } catch (err: any) {
      setScannerResult({ success: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCheckInCode(manualCode.trim());
    setManualCode('');
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back link */}
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Console</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Scanner / Action Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
              
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" /> Gate Check-In Terminal
                </h3>
                <p className="text-slate-400 text-xs mt-1">Scan visitor e-Tickets or key in details manually.</p>
              </div>

              {/* QR scanner element */}
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl overflow-hidden">
                <div id="qr-reader" className="w-full text-slate-400 text-xs"></div>
              </div>

              {/* Manual Lookup form */}
              <form onSubmit={handleManualSubmit} className="space-y-4 pt-4 border-t border-slate-850">
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter manual Ticket ID (e.g. rsvp-XXX)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-grow px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Check In
                  </button>
                </div>
              </form>

              {/* Scan Results Display */}
              {scannerResult && (
                <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 ${
                  scannerResult.success 
                    ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' 
                    : 'bg-rose-950/20 border-rose-900 text-rose-400'
                }`}>
                  <div className="font-bold text-sm">{scannerResult.text}</div>
                  {scannerResult.name && <div className="text-xs">Attendee: <span className="font-semibold text-white">{scannerResult.name}</span></div>}
                  {scannerResult.time && <div className="text-[10px] text-slate-500">Checked in at {scannerResult.time}</div>}
                </div>
              )}

            </div>
          </div>

          {/* Stats / Recents Column */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Stats Card */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Visitor Statistics</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-955 p-3 rounded-lg border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Checked In</span>
                  <span className="text-2xl font-bold text-blue-400">{checkinCount}</span>
                </div>
                <div className="bg-slate-955 p-3 rounded-lg border border-slate-850 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total RSVPs</span>
                  <span className="text-2xl font-bold text-white">{totalCount}</span>
                </div>
              </div>

              {/* Attendance percentage indicator bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (checkinCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Recents list */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Recent Arrivals</span>
                <button onClick={fetchProfileAndStats} className="text-slate-505 hover:text-white transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </h4>

              {recentCheckins.length === 0 ? (
                <p className="text-xs text-slate-550 italic">No check-ins logged yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentCheckins.map((rc) => (
                    <li key={rc.id} className="text-xs border-b border-slate-850 pb-2 last:border-b-0 last:pb-0">
                      <div className="font-semibold text-white truncate">{rc.name}</div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-0.5">
                        <span>{rc.email}</span>
                        <span>{new Date(rc.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
