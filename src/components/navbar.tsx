'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Landmark, Home, FileText, Star, Clock
} from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

function NavLink({ href, children, onClick, className = '', isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
        ${isActive
          ? 'text-primary bg-primary/10 border border-primary/20'
          : 'text-slate-350 hover:text-white hover:bg-slate-800/40'
        } ${className}`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    header_logo_label: 'National Level Hackathon',
    header_logo_title: 'ARVIX NEXUS 2026',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setBrandSettings({
            header_logo_label: data.header_logo_label || 'National Level Hackathon',
            header_logo_title: data.header_logo_title || 'ARVIX NEXUS 2026',
          });
        }
      } catch (err) {
        console.error('Error loading brand settings in Navbar:', err);
      }
    };
    fetchSettings();
  }, []);

  const pathname = usePathname();
  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const publicLinks = [
    { href: '/#about', label: 'About', icon: Home },
    { href: '/#themes', label: 'Themes', icon: Star },
    { href: '/#timeline', label: 'Timeline', icon: Clock },
    { href: '/#venue', label: 'Venue', icon: Landmark },
    { href: '/#faqs', label: 'FAQs', icon: FileText },
  ];

  // Helper to check active state including hash links
  const isLinkActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 w-full
          ${scrolled
            ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-3'
            : 'bg-bg-primary/40 backdrop-blur-md border-b border-white/5 py-5'
          }`}
      >
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3.5 group flex-shrink-0"
              onClick={closeMenu}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 group-hover:scale-[1.04] transition-all duration-300">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold leading-none">
                    {brandSettings.header_logo_label}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
                </div>
                <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight mt-0.5 group-hover:text-primary transition-colors duration-300">
                  {brandSettings.header_logo_title}
                </h1>
              </div>
              {/* Mobile logo text */}
              <span className="block sm:hidden text-base font-extrabold text-white tracking-tight">ARVIX NEXUS</span>
            </Link>

            {/* ── Desktop Navigation ── */}
            <div className="hidden lg:flex items-center gap-1.5">
              {publicLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} isActive={isLinkActive(href)}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* ── Desktop Action ── */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 hover:scale-[1.02] rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300"
              >
                Register Now
              </a>
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-white/5 hover:border-white/15 transition-all duration-300"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>
      )}

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 sm:w-80 bg-surface border-l border-white/5 shadow-2xl lg:hidden
          transform transition-transform duration-350 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Landmark className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">ARVIX NEXUS</span>
          </div>
          <button
            onClick={closeMenu}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-450 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex flex-col h-full overflow-y-auto pb-24">

          {/* Navigation Links */}
          <div className="px-5 mt-6 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2.5">Navigation</p>
            {publicLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${pathname === href
                    ? 'bg-primary/10 text-primary border border-primary/25'
                    : 'text-slate-350 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          {/* Register Action */}
          <div className="px-5 mt-auto pt-6 border-t border-white/5 mt-6">
            <a
              href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all duration-300"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
