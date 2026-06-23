import Link from 'next/link';
import { Landmark, Mail, ShieldCheck, GitBranch, Globe, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-surface text-slate-400 border-t border-white/5 overflow-hidden">
      {/* Subtle top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-20 pb-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex-shrink-0">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Government of India</p>
                <p className="text-white font-extrabold tracking-tight leading-tight mt-0.5">National Hackathon</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400">
              Organised by the Ministry of Electronics & Information Technology (MeitY), promoting developer innovation, digital governance, and national tech capacity building.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="inline-flex items-center gap-1.5 text-xs bg-bg-primary/60 text-slate-400 py-1.5 px-3 rounded-full border border-white/5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
                <span>Secure SSL Portal</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs bg-bg-primary/60 text-slate-400 py-1.5 px-3 rounded-full border border-white/5">
                <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>ARVIX 2026</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-5 lg:pl-10">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/hackathon/problems', label: 'Problem Statements' },
                { href: '/#timeline', label: 'Judging Timeline' },
                { href: '/#speakers', label: 'Speakers & Guests' },
                { href: '/hackathon/leaderboard', label: 'Live Leaderboard' },
                { href: '/event/rsvp', label: 'RSVP Registration' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-5 lg:pl-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3">
              {[
                { href: '/event/press', label: 'Digital Press Kit' },
                { href: '/signup', label: 'Participant Registry' },
                { href: '/login', label: 'Organizer Portal' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Contact & Support</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Have questions about registration, team formation, or technical criteria? Reach out directly.
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@arvix2026.gov.in"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-primary transition-colors duration-300 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-bg-primary flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all duration-300 flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="break-all font-medium">support@arvix2026.gov.in</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2.5 text-sm text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-bg-primary flex items-center justify-center border border-white/5 flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">+91-11-2436-0199</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <p>© {currentYear} National Launch & Hybrid Hackathon. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <a
                href="https://github.com/Sujith574/ARVIXNEXUS2026"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
