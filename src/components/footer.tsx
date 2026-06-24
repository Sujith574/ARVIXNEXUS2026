'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Landmark, Mail, ShieldCheck, GitBranch, Globe, Phone, ExternalLink 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    footer_logo_label: 'National Level Hackathon',
    footer_logo_title: 'ARVIX NEXUS 2026',
    footer_description: 'ARVIX NEXUS 2026 is a premier national-level innovation hackathon organized by the Arvix Team, hosted at Lovely Professional University. Empowering developers, creators, and innovators to build tomorrow\'s technology solutions.',
    footer_copyright: `© ${currentYear} ARVIX NEXUS National Level Innovation Hackathon. All rights reserved.`,
    support_email: 'sujithlavudu@gmail.com',
    support_phone: '+91-7331161928',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            footer_logo_label: data.footer_logo_label || 'National Level Hackathon',
            footer_logo_title: data.footer_logo_title || 'ARVIX NEXUS 2026',
            footer_description: data.footer_description || 'ARVIX NEXUS 2026 is a premier national-level innovation hackathon organized by the Arvix Team, hosted at Lovely Professional University. Empowering developers, creators, and innovators to build tomorrow\'s technology solutions.',
            footer_copyright: data.footer_copyright || `© ${currentYear} ARVIX NEXUS National Level Innovation Hackathon. All rights reserved.`,
            support_email: data.support_email || 'sujithlavudu@gmail.com',
            support_phone: data.support_phone || '+91-7331161928',
          });
        }
      } catch (err) {
        console.error('Error fetching settings in Footer:', err);
      }
    };
    fetchSettings();
  }, [currentYear]);

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-white/5 overflow-hidden">
      {/* Subtle top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      {/* Mock Sponsor Logos Grid Centered */}
      <div className="border-b border-white/5 bg-slate-900/10 py-10">
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex flex-col items-center justify-center gap-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">In Collaboration With</span>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white tracking-wider uppercase">MeitY</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white tracking-wider uppercase">Digital India</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white tracking-wider uppercase">Startup India</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white tracking-wider uppercase">LPU Campus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20 pt-24 pb-16 flex flex-col items-center text-center space-y-16">
        
        {/* Brand Info Stacked & Centered */}
        <div className="flex flex-col items-center space-y-6 max-w-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex-shrink-0">
              <Landmark className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{settings.footer_logo_label}</p>
              <p className="text-white font-extrabold tracking-tight leading-tight mt-1 text-xl">{settings.footer_logo_title}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-400">
            {settings.footer_description}
          </p>

          {/* Social Icons Centered */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/15 hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/15 hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://github.com/Sujith574/ARVIXNEXUS2026" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/15 hover:text-primary flex items-center justify-center transition-all duration-300" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Grid Centered Row */}
        <div className="flex flex-wrap items-start justify-center gap-12 sm:gap-20 w-full">
          
          {/* Navigation */}
          <div className="space-y-5 flex flex-col items-center text-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '/#about', label: 'About Event' },
                { href: '/#themes', label: 'Problem Themes' },
                { href: '/#timeline', label: 'Event Timeline' },
                { href: '/#venue', label: 'Venue & Details' },
                { href: '/#faqs', label: 'FAQs' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-primary transition-all duration-300 inline-block font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Registration */}
          <div className="space-y-5 flex flex-col items-center text-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Registration</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-primary transition-all duration-300 inline-block font-medium"
                >
                  Register on KonfHub
                </a>
              </li>
              {[
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-primary transition-all duration-300 inline-block font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-5 flex flex-col items-center text-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3 flex flex-col items-center">
              <li>
                <a
                  href={`mailto:${settings.support_email}`}
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-primary transition-colors duration-300 group justify-center"
                >
                  <Mail className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="break-all font-medium">{settings.support_email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${settings.support_phone}`}
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-primary transition-colors duration-300 group justify-center"
                >
                  <Phone className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{settings.support_phone}</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Centered */}
        <div className="w-full mt-16 pt-8 border-t border-white/5 flex flex-col items-center text-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
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
          <p className="text-xs text-slate-500 font-medium">{settings.footer_copyright}</p>
        </div>
      </div>
    </footer>
  );
}
