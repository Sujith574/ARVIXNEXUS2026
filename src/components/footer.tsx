import Link from 'next/link';
import { Landmark, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo / Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-slate-800">
                <Landmark className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-white font-bold tracking-tight">National Launch & Hackathon</span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed">
              Organised by the Ministry of Electronics & Information Technology (MeitY), Government of India, promoting developer innovation and digital governance systems.
            </p>
            <div className="flex items-center space-x-2 text-xs bg-slate-900/50 text-slate-500 py-1 px-2.5 rounded-md border border-slate-800 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Government Portal</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Event Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hackathon/problems" className="hover:text-blue-400 transition-colors">
                  Problem Statements
                </Link>
              </li>
              <li>
                <Link href="/hackathon/leaderboard" className="hover:text-blue-400 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/event/press" className="hover:text-blue-400 transition-colors">
                  Press Kit
                </Link>
              </li>
              <li>
                <Link href="/event/rsvp" className="hover:text-blue-400 transition-colors">
                  RSVP Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li className="flex items-center gap-1.5 pt-2 text-slate-350 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-500" />
                <a href="mailto:support@your-hackathon.gov.in" className="hover:underline">
                  support@your-hackathon.gov.in
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} National Launch & Hackathon. All rights reserved.</p>
          <p className="mt-2 md:mt-0 text-slate-600">
            For demonstration purposes only (your-hackathon.gov.in)
          </p>
        </div>
      </div>
    </footer>
  );
}
