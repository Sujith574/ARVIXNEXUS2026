import Link from 'next/link';
import { Landmark, Mail, ShieldCheck, GitBranch, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-slate-800/60 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-page pt-24 sm:pt-32 pb-16">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16">

          {/* Brand Info — spans 2 cols on lg */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex-shrink-0">
                <Landmark className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-400/70 font-semibold">Government of India</p>
                <p className="text-white font-bold tracking-tight leading-tight">National Launch & Hackathon</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Organised by the Ministry of Electronics & Information Technology (MeitY), promoting developer innovation, digital governance, and national tech capacity building.
            </p>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs bg-slate-900/60 text-slate-500 py-1.5 px-3 rounded-full border border-slate-800 hover:border-slate-700 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Secure Government Portal</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs bg-slate-900/60 text-slate-500 py-1.5 px-3 rounded-full border border-slate-800">
                <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>ARVIX NEXUS 2026</span>
              </div>
            </div>
          </div>

          {/* Event Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Event Portal</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Event Home' },
                { href: '/hackathon/problems', label: 'Problem Statements' },
                { href: '/hackathon/leaderboard', label: 'Live Leaderboard' },
                { href: '/event/rsvp', label: 'RSVP Registration' },
                { href: '/event/press', label: 'Press Kit & Media' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-0.5 transition-all duration-200 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Support & Legal</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/signup', label: 'Register Account' },
                { href: '/login', label: 'Portal Login' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-0.5 transition-all duration-200 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}

              <li className="pt-1">
                <a
                  href="mailto:support@arvix2026.gov.in"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 group"
                >
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="break-all">support@arvix2026.gov.in</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
            <p>© {currentYear} National Launch & Hybrid Hackathon 2026. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <a
                href="https://github.com/Sujith574/ARVIXNEXUS2026"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-slate-400 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
