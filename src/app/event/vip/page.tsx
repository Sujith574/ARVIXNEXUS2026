'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, FileText, Calendar, Car, Bell, PhoneCall, Loader2, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function VIPDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vipDocs, setVipDocs] = useState<any[]>([]);
  const [currentCue, setCurrentCue] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [supabase, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Fetch VIP lounge details (profile & docs) from MongoDB API
      const res = await fetch('/api/event/vip');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setVipDocs(data.documents || []);

      // 2. Subscribe to Realtime Stage Cues via Supabase Broadcast
      const channel = supabase.channel(`vip-cues-${user.id}`)
        .on('broadcast', { event: 'stage-cue' }, ({ payload }) => {
          setCurrentCue(payload.message);
          // Play a soft notification chime if supported
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav');
            audio.play();
          } catch (e) {}
        })
        .subscribe();

      setLoading(false);

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error fetching VIP lounge data:', err);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(194,120,3,0.05),rgba(255,255,255,0))]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Real-time Stage Cue Toast alert */}
        {currentCue && (
          <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl text-amber-400 flex items-start gap-3 shadow-lg animate-bounce">
            <Bell className="w-5 h-5 flex-shrink-0 animate-swing" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider block">Live Stage Cue Notification</span>
              <p className="font-semibold text-sm text-white">{currentCue}</p>
            </div>
            <button
              onClick={() => setCurrentCue(null)}
              className="ml-auto text-xs text-slate-500 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-slate-900/40 p-8 rounded-2xl border border-amber-900/30 backdrop-blur-sm shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-950/60 text-amber-400 border border-amber-900/50 py-1 px-3 rounded-full font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> High-Security VIP Lounge
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">Welcome, {profile?.full_name}</h2>
            <p className="text-slate-400 text-xs">
              Access your encrypted briefing papers, transportation liaisons, and timing triggers below.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Briefing Documents Card */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Secure Briefing Documents
            </h3>
            
            {vipDocs.length === 0 ? (
              <div className="flex items-center gap-2 bg-slate-950 p-4 border border-slate-850 rounded-xl text-slate-550 text-xs italic">
                <Info className="w-4 h-4 text-slate-655" />
                <span>No private briefing documents have been uploaded for you.</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {vipDocs.map((doc) => (
                  <li key={doc.id} className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl flex items-center justify-between group hover:border-slate-750 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-xs">{doc.title}</span>
                    </div>
                    <a
                      href={doc.file_url}
                      className="text-xs text-blue-400 hover:underline font-bold"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Transport Liaison Card */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" /> Transport & Liaison Officer
            </h3>

            <div className="bg-slate-950 p-5 border border-slate-850 rounded-xl space-y-3 text-xs text-slate-350">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span>Assigned Officer</span>
                <span className="font-semibold text-white">Shri V. K. Singh, IAS</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span>Vehicle Assigned</span>
                <span className="font-semibold text-white">Govt. SUV (DL-1CA-XXXX)</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span>Pickup Time</span>
                <span className="font-semibold text-white">08:15 AM, July 10</span>
              </div>
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-1.5 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-900 text-blue-400 rounded-lg font-semibold text-xs mt-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Liaison Desk (+91 98765 43210)</span>
              </a>
            </div>
          </div>

          {/* Private Itinerary Card */}
          <div className="md:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Stage Placement & Private Itinerary
            </h3>

            <div className="space-y-4">
              <div className="relative border-l border-slate-800 ml-2 space-y-5 pl-5 pt-1 text-xs">
                
                <div className="relative">
                  <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">09:30 AM — July 10</span>
                    <h4 className="font-semibold text-white text-sm">Arrival & VIP Lounge Welcome</h4>
                    <p className="text-slate-400">Reception by Senior MeitY Directors. Private briefing at Lounge Room 3.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">10:00 AM — July 10</span>
                    <h4 className="font-semibold text-white text-sm">Stage Entrance & Keynote Chair</h4>
                    <p className="text-slate-400">Proceed to Stage Seat #A4. Presentation of flower bouquet and launch remote.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">11:15 AM — July 10</span>
                    <h4 className="font-semibold text-white text-sm">Lawn Interaction & High Tea</h4>
                    <p className="text-slate-400">Join the Cabinet Secretary for private interactions with national media anchors.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
