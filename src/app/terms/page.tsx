import Link from 'next/link';
import { ArrowLeft, Landmark, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
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
              <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
              <span className="text-xs text-slate-500">Effective Date: June 22, 2026</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-base">1. User Registrations & Eligibility</h3>
            <p>
              By registering an account on this portal, you certify that all information provided is accurate and represents your real identity. Participants in the innovation hackathon must be citizens of India and agree to comply with team capacity rules (maximum of 4 members per team).
            </p>

            <h3 className="text-white font-bold text-base">2. Intellectual Property (IP)</h3>
            <p>
              All code and intellectual property submitted during the hackathon remain the property of the respective teams. However, by submitting a project, you grant the organizing ministries a non-exclusive license to review, test, and demonstrate the solution for public service development.
            </p>

            <h3 className="text-white font-bold text-base">3. VIP Access Tiers & e-Ticketing</h3>
            <p>
              RSVP invitation codes (such as VIP and Press Tiers) are non-transferable. Presenting cloned, forged, or unauthorized QR codes at the gate of Vigyan Bhawan constitutes a security breach and will be reported to appropriate law enforcement authorities immediately.
            </p>

            <h3 className="text-white font-bold text-base">4. System Integrity & Security</h3>
            <p>
              Any attempt to compromise the security of this portal (including SQL injection, cross-site scripting, or RLS bypass attempts) will result in immediate disqualification and termination of registration.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-850 flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Under jurisdiction of Ministry of Electronics & IT (MeitY), Government of India.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
