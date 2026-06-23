import Link from 'next/link';
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-grow bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6 text-sm text-slate-350 leading-relaxed">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-850">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-450">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
              <span className="text-xs text-slate-505">Effective Date: June 22, 2026</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-base">1. Information We Collect</h3>
            <p>
              We collect profile details (name, email, phone number, GitHub repositories, and coding skills) from registered participants. For RSVP guests, we store name, email, access tier, and check-in gate timestamp data to coordinate security clearances.
            </p>

            <h3 className="text-white font-bold text-base">2. Storage & Security</h3>
            <p>
              Your data is secured using industry-standard Row-Level Security (RLS) on Supabase PostgreSQL databases. Secure documents assigned to VIP accounts are restricted via specific SQL policies so that they can only be read by the designated user and authorized government administrators.
            </p>

            <h3 className="text-white font-bold text-base">3. Media Coverage Disclaimers</h3>
            <p>
              The launch event and hackathon opening session will be broadcast live. By attending the physical venue at Vigyan Bhawan, New Delhi, you consent to being photographed and recorded for media coverage and official press kits.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-850 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted e-Registry Data Management Protection Suite</span>
          </div>
        </div>

      </div>
    </div>
  );
}
