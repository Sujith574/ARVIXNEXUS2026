'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, MapPin, Play, Radio, Users, ChevronRight, 
  ChevronDown, Volume2, Trophy, ArrowRight, Zap, Shield, Star, 
  Award, Landmark
} from 'lucide-react';

const DEFAULT_AGENDA = [
  { time: '09:00 AM', title: 'Delegate Registration & Welcome', speaker: 'Reception Desk', type: 'session', details: 'Check-in at the registration desks, collect delegate badges and kits, and proceed to the networking lobby.' },
  { time: '10:00 AM', title: 'Inaugural Address & National Launch', speaker: 'Hon\'ble Minister, MeitY', type: 'keynote', details: 'Keynote speech launching the National Digital Stack 2026 and outline of digital policies for the coming fiscal year.' },
  { time: '11:15 AM', title: 'Unveiling of the Digital Stack 2026', speaker: 'MeitY Secretary & Tech Leads', type: 'keynote', details: 'In-depth walk-through of the new public governance APIs, identity systems, and sandbox tools for participants.' },
  { time: '12:00 PM', title: 'Panel: Scaling AI in Public Service Delivery', speaker: 'Industry Experts & Senior IAS Officers', type: 'session', details: 'A panel discussion on deploying scalable machine learning models in civic tech, municipal operations, and healthcare.' },
  { time: '01:00 PM', title: 'Networking Lunch & Media Interaction', speaker: 'All Delegates', type: 'break', details: 'Catered lunch at the dining hall with slots for press interaction and stakeholder networking.' },
  { time: '02:00 PM', title: 'National Hackathon Opening Ceremony', speaker: 'Hackathon Organizing Committee', type: 'session', details: 'Rules briefing, portal access walk-through, and official launch of the 48-hour hacking phase.' },
];

const DEFAULT_SPEAKERS = [
  { name: 'Shri Ashwini Vaishnaw', role: 'Hon\'ble Minister', org: 'MeitY, Government of India', bio: 'Leading digital transformation initiatives, railways, and telecom infrastructure across the nation.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face' },
  { name: 'Dr. Neeta Verma', role: 'Director General', org: 'National Informatics Centre (NIC)', bio: 'Pioneered government cloud deployment and mobile-first citizen services across Indian districts.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face' },
  { name: 'Dr. Rajendra Kumar, IAS', role: 'Additional Secretary', org: 'MeitY, Government of India', bio: 'Expert in e-governance policies, regional integration, and emerging tech implementations.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
];

const DEFAULT_ROUNDS = [
  { round_number: 1, title: 'Ideation & Stack Submission', date: 'July 10, 2026', timeline: '02:00 PM – 06:00 PM', description: 'Teams register, submit stacks, and pitch core ideas to review panels.' },
  { round_number: 2, title: 'Prototype Evaluation', date: 'July 11, 2026', timeline: '10:00 AM – 05:00 PM', description: 'Mid-point checkin with technical mentors and initial scoring.' },
  { round_number: 3, title: 'Grand Finale Pitching', date: 'July 12, 2026', timeline: '09:00 AM – 04:00 PM', description: 'Working prototypes presented to VIP guest panel for final grading.' },
];

const ROUND_COLORS = [
  { bg: 'from-primary to-blue-600', badge: 'bg-primary/10 text-primary border-primary/20', border: 'hover:border-primary/40' },
  { bg: 'from-secondary to-indigo-650', badge: 'bg-secondary/10 text-secondary border-secondary/20', border: 'hover:border-secondary/40' },
  { bg: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', border: 'hover:border-emerald-500/40' },
];

const AGENDA_TYPE_STYLES: Record<string, string> = {
  keynote: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  session: 'bg-primary/10 text-primary border-primary/20',
  break: 'bg-success/10 text-success border-success/20',
};

export default function EventLandingPage() {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [playStream, setPlayStream] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Agenda Accordion State
  const [activeAgendaId, setActiveAgendaId] = useState<number | null>(1);

  const eventDate = new Date('2026-07-10T09:00:00+05:30').getTime();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await fetch('/api/event/landing');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (data.agenda?.length > 0) {
          setAgenda(data.agenda.map((item: any) => ({
            time: new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: item.title,
            speaker: item.speaker?.full_name || item.description || 'Guest Speaker',
            type: item.type,
            details: item.description || 'No additional details provided.',
          })));
        } else {
          setAgenda(DEFAULT_AGENDA);
        }

        if (data.speakers?.length > 0) {
          setSpeakers(data.speakers.map((s: any) => ({
            name: s.full_name,
            role: s.linkedin || 'Senior Tech Lead',
            org: s.organization || 'MeitY',
            bio: s.skills?.length > 0 ? `Expertise in ${s.skills.join(', ')}` : 'Dedicated to national digital infrastructure.',
            image: s.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          })));
        } else {
          setSpeakers(DEFAULT_SPEAKERS);
        }

        setRounds(data.rounds?.length > 0 ? data.rounds : DEFAULT_ROUNDS);
      } catch {
        setAgenda(DEFAULT_AGENDA);
        setSpeakers(DEFAULT_SPEAKERS);
        setRounds(DEFAULT_ROUNDS);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchEventData();

    const interval = setInterval(() => {
      const diff = eventDate - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const countdownUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="flex-grow bg-bg-primary text-slate-100 flex flex-col overflow-x-hidden">

      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-24 lg:pb-28">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-[90px] animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left side content */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>National Hackathon & Launch 2026</span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-heading tracking-tight text-white leading-none">
                Unveiling the <br/>
                <span className="gradient-text-accent">Digital Infrastructure</span> <br/>
                of Tomorrow
              </h1>

              <p className="body-text max-w-2xl">
                Join India&apos;s premier hybrid innovation initiative. Develop next-generation public stack APIs, secure systems, and tech frameworks that power citizen-centric governance.
              </p>

              {/* Info chips */}
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: Calendar, text: 'July 10–12, 2026', color: 'text-primary' },
                  { icon: MapPin, text: 'Vigyan Bhawan, New Delhi', color: 'text-secondary' },
                  { icon: Users, text: '1000+ Teams Selected', color: 'text-emerald-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-2.5 bg-surface/60 border border-white/5 text-slate-300 px-4.5 py-3 rounded-2xl text-sm font-semibold shadow-sm">
                      <Icon className={`w-4.5 h-4.5 ${item.color} flex-shrink-0`} />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/event/rsvp"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>RSVP Guest Invitation</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4.5 border border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Register for Hackathon</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-3 pt-6 border-t border-white/5 max-w-lg">
                <div className="flex -space-x-3">
                  <img className="w-9 h-9 rounded-full border-2 border-surface object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop" alt="avatar" />
                  <img className="w-9 h-9 rounded-full border-2 border-surface object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop" alt="avatar" />
                  <img className="w-9 h-9 rounded-full border-2 border-surface object-cover" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=60&h=60&fit=crop" alt="avatar" />
                </div>
                <p className="text-xs text-slate-450 font-medium">
                  Supported by senior administrators, policy architects, and industry experts.
                </p>
              </div>
            </div>

            {/* Right side illustration / floating elements */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              {/* Behind lights */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full filter blur-3xl opacity-60 z-0 pointer-events-none" />

              <div className="relative z-10 w-full max-w-[440px] space-y-6">
                
                {/* Visual Header / Holographic representation */}
                <div className="glass-card card-padding gradient-border-glow animate-float">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Prize Pool</span>
                    <Star className="w-4 h-4 text-warning" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-white">₹1,000,000+</h3>
                  <p className="text-xs text-slate-450 mt-1">Cash rewards, grants & cloud credits for top prototypes.</p>
                </div>

                {/* Event Highlights Floating Card */}
                <div className="glass-card card-padding gradient-border-glow animate-float-delayed">
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">National Recognition</h4>
                      <p className="text-xs text-slate-450">Deploy into public systems</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/5 my-3" />
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-slate-450">Track:</span>
                    <span className="bg-primary/10 text-primary border border-primary/15 px-2.5 py-0.5 rounded-full font-bold">AI & Gov Tech</span>
                  </div>
                </div>

                {/* Date Highlight Card */}
                <div className="glass-card p-5 gradient-border-glow flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Calendar className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-450 uppercase tracking-widest font-bold">Inauguration</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">July 10, 2026 @ 09:30 AM</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          COUNTDOWN SECTION
          ═══════════════════════════════════ */}
      <section id="countdown" className="relative z-10 w-full max-w-[1400px] mx-auto px-8 mb-16">
        <div className="glass-card gradient-border-glow p-8 sm:p-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left space-y-2 max-w-md">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="text-base font-extrabold text-white uppercase tracking-widest">Inauguration Countdown</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Live broadcast begins July 10 at Vigyan Bhawan. Register now to claim your credential key.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4.5">
            {countdownUnits.map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-3 sm:gap-4.5">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface border border-white/5 text-2xl sm:text-3xl font-extrabold text-primary tabular-nums shadow-inner">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-500 mt-2">{unit.label}</span>
                </div>
                {i < countdownUnits.length - 1 && (
                  <span className="text-slate-700 text-xl font-bold hidden xs:inline pb-6">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          STATISTICS SECTION
          ═══════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '25,000+', label: 'Applicants nationwide', icon: Users, color: 'text-primary' },
            { value: '₹10 Lakhs', label: 'Total Prize Funding', icon: Trophy, color: 'text-warning' },
            { value: '48 Hours', label: 'Continuous Building', icon: Clock, color: 'text-secondary' },
            { value: '3 Rounds', label: 'Rigorous Evaluation', icon: Shield, color: 'text-emerald-400' },
          ].map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="glass-card card-padding flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-extrabold text-white tracking-tight">{value}</h4>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          STREAM / VIDEO SECTION
          ═══════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-8 py-12">
        <div className="glass-card overflow-hidden gradient-border-glow relative aspect-video w-full max-w-[1000px] mx-auto shadow-2xl">
          {!playStream ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/95 z-10 p-6 text-center space-y-5">
              <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wide">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Live Broadcast Offline
              </div>
              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-bold text-white">Stream goes Live July 10, 09:30 AM</h4>
                <p className="text-slate-450 text-xs sm:text-sm max-w-sm mx-auto">Watch VIP addresses, digital stack walk-throughs, and judging queries live.</p>
              </div>
              <button
                onClick={() => setPlayStream(true)}
                className="flex items-center gap-2 py-3 px-6 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Preview Stream Setup</span>
              </button>
            </div>
          ) : (
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&mute=1"
              title="Government Launch Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════
          TIMELINE SECTION (JUDGING TIMELINE)
          ═══════════════════════════════════ */}
      <section id="timeline" className="section-py relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Shield className="w-4 h-4" />
              <span>Judging Progress</span>
            </div>
            <h2 className="section-heading text-white">Evaluation Timeline</h2>
            <p className="body-text">
              Our hackathon follows a structured three-round evaluation. Teams must submit progress milestones on the portal at each checkpoint.
            </p>
          </div>

          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Horizontal Line Connector */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-secondary/10 -translate-y-1/2 z-0 hidden lg:block" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              {rounds.map((round, i) => {
                const colors = ROUND_COLORS[i % ROUND_COLORS.length];
                return (
                  <div
                    key={round.id || round.round_number}
                    className={`glass-card p-8 sm:p-10 flex flex-col justify-between space-y-6 ${colors.border}`}
                  >
                    <div className="space-y-4">
                      {/* Badge / Timeline Stack */}
                      <div className="flex justify-between items-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${colors.badge}`}>
                          Round {round.round_number}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{round.timeline}</span>
                      </div>

                      {/* Header */}
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {round.title}
                      </h3>
                      
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {round.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Submission Date</span>
                        <span className="text-sm font-semibold text-slate-200">{round.date}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white text-xs font-bold`}>
                        {round.round_number}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          AGENDA SECTION
          ═══════════════════════════════════ */}
      <section className="section-py relative bg-surface/30 border-y border-white/5">
        <div className="w-full max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Col Info */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Calendar className="w-4 h-4" />
                <span>Itinerary</span>
              </div>
              <h2 className="section-heading text-white">Event Agenda</h2>
              <p className="body-text">
                Check schedule coordinates for keynotes, digital stack walkthroughs, panels, and networking hours.
              </p>
              
              <div className="p-6 bg-bg-primary/60 border border-white/5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Landmark className="w-4.5 h-4.5 text-primary" />
                  <span>Important Notice</span>
                </h4>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Agenda items are scheduled in India Standard Time (IST). Links to virtual session rooms will activate 10 minutes prior to execution.
                </p>
              </div>
            </div>

            {/* Right Col Interactive Accordion */}
            <div className="lg:col-span-8 space-y-4">
              {agenda.map((item, idx) => {
                const typeStyle = AGENDA_TYPE_STYLES[item.type] || AGENDA_TYPE_STYLES.session;
                const isExpanded = activeAgendaId === idx;
                return (
                  <div
                    key={idx}
                    className={`glass-card overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'border-primary/30 bg-surface/60' : 'border-white/5'
                    }`}
                  >
                    {/* Header bar */}
                    <button
                      onClick={() => setActiveAgendaId(isExpanded ? null : idx)}
                      className="w-full p-6 sm:p-7 flex items-center justify-between text-left gap-4"
                    >
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4.5 min-w-0">
                        {/* Time */}
                        <span className="text-sm font-bold text-primary flex items-center gap-1.5 flex-shrink-0">
                          <Clock className="w-4 h-4" />
                          {item.time}
                        </span>
                        
                        {/* Session Type Badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typeStyle} flex-shrink-0`}>
                          {item.type}
                        </span>

                        {/* Title */}
                        <h4 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>

                    {/* Expandable details */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[250px] border-t border-white/5' : 'max-h-0'
                      } overflow-hidden`}
                    >
                      <div className="p-6 sm:p-7 space-y-4 bg-bg-primary/30">
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {item.details || 'Join the session to learn about government stack development schemes.'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Speaker:</span>
                            <span className="text-xs text-slate-200 font-semibold">{item.speaker}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          SPEAKERS SECTION
          ═══════════════════════════════════ */}
      <section id="speakers" className="section-py relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Users className="w-4 h-4" />
              <span>Dignitaries</span>
            </div>
            <h2 className="section-heading text-white">Distinguished Guests</h2>
            <p className="body-text">
              Learn about the policymakers, technology directors, and industry specialists leading our panels and evaluation keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speakers.map((sp, idx) => (
              <div
                key={idx}
                className="glass-card overflow-hidden group flex flex-col h-full"
              >
                {/* Profile Photo */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                  <img
                    src={sp.image}
                    alt={sp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                </div>

                {/* Details */}
                <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wide">
                      <Landmark className="w-3.5 h-3.5" />
                      <span>{sp.org}</span>
                    </div>
                    <h4 className="text-xl font-extrabold text-white">{sp.name}</h4>
                    <p className="text-xs text-secondary font-bold uppercase tracking-wider">{sp.role}</p>
                    <p className="text-sm text-slate-400 leading-relaxed pt-2">
                      {sp.bio}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Keynote Speaker</span>
                    <a
                      href="#"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/25 border border-white/5 hover:border-primary/20 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Card CTA */}
          <div className="mt-16 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-xl">
            <Trophy className="w-12 h-12 text-warning mx-auto animate-bounce" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Think You Have What It Takes?</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Join thousands of designers, developers, and blockchain architects solving critical civic tech challenges.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <span>Create Registration Key</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          MEDIA ASSETS CTA
          ═══════════════════════════════════ */}
      <section className="section-py bg-surface/20 border-t border-white/5">
        <div className="w-full max-w-[1400px] mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Volume2 className="w-4.5 h-4.5" />
              <span>Resources</span>
            </div>
            <h2 className="section-heading text-white">Media & Press Assets</h2>
            <p className="body-text">
              Download official platform logos, speaker photos, digital flyers, and media itineraries in the digital press kit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/event/press"
                className="inline-flex items-center justify-center gap-2.5 py-3.5 px-8 border border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-primary" />
                <span>Access Press Kit</span>
              </Link>
              <Link
                href="/hackathon/leaderboard"
                className="inline-flex items-center justify-center gap-2.5 py-3.5 px-8 border border-warning/20 bg-warning/10 hover:bg-warning/20 text-warning hover:text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <Trophy className="w-4 h-4" />
                <span>View Live Standings</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
