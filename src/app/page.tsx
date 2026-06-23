'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Play, Radio, Users, ChevronRight, Volume2, Trophy, ArrowRight, Zap, Shield, Star } from 'lucide-react';

const DEFAULT_AGENDA = [
  { time: '09:00 AM', title: 'Delegate Registration & Welcome', speaker: 'Reception Desk', type: 'session' },
  { time: '10:00 AM', title: 'Inaugural Address & National Launch', speaker: 'Hon\'ble Minister, MeitY', type: 'keynote' },
  { time: '11:15 AM', title: 'Unveiling of the Digital Stack 2026', speaker: 'MeitY Secretary & Tech Leads', type: 'keynote' },
  { time: '12:00 PM', title: 'Panel: Scaling AI in Public Service Delivery', speaker: 'Industry Experts & Senior IAS Officers', type: 'session' },
  { time: '01:00 PM', title: 'Networking Lunch & Media Interaction', speaker: 'All Delegates', type: 'break' },
  { time: '02:00 PM', title: 'National Hackathon Opening Ceremony', speaker: 'Hackathon Organizing Committee', type: 'session' },
];

const DEFAULT_SPEAKERS = [
  { name: 'Shri Ashwini Vaishnaw', role: 'Hon\'ble Minister, MeitY', bio: 'Leading digital transformation initiatives and tech innovation frameworks across the nation.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face' },
  { name: 'Dr. Neeta Verma', role: 'Director General, NIC', bio: 'Pioneered government cloud deployment and mobile-first citizen services across Indian districts.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face' },
  { name: 'Dr. Rajendra Kumar, IAS', role: 'Additional Secretary, MeitY', bio: 'Expert in e-governance policies and emerging technologies integration.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
];

const DEFAULT_ROUNDS = [
  { round_number: 1, title: 'Ideation & Stack Submission', date: 'July 10, 2026', timeline: '02:00 PM – 06:00 PM', description: 'Teams register, submit stacks, and pitch core ideas to review panels.' },
  { round_number: 2, title: 'Prototype Evaluation', date: 'July 11, 2026', timeline: '10:00 AM – 05:00 PM', description: 'Mid-point checkin with technical mentors and initial scoring.' },
  { round_number: 3, title: 'Grand Finale Pitching', date: 'July 12, 2026', timeline: '09:00 AM – 04:00 PM', description: 'Working prototypes presented to VIP guest panel for final grading.' },
];

const ROUND_COLORS = [
  { bg: 'from-blue-500 to-blue-600', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', border: 'hover:border-blue-500/40' },
  { bg: 'from-indigo-500 to-indigo-600', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', border: 'hover:border-indigo-500/40' },
  { bg: 'from-violet-500 to-violet-600', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', border: 'hover:border-violet-500/40' },
];

const AGENDA_TYPE_STYLES: Record<string, string> = {
  keynote: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  session: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  break: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function EventLandingPage() {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [playStream, setPlayStream] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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
          })));
        } else {
          setAgenda(DEFAULT_AGENDA);
        }

        if (data.speakers?.length > 0) {
          setSpeakers(data.speakers.map((s: any) => ({
            name: s.full_name,
            role: s.linkedin || 'Senior Tech Lead, MeitY',
            bio: s.skills?.length > 0 ? `Expertise in ${s.skills.join(', ')}` : 'Dedicated to national digital infrastructure.',
            image: s.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
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
    <div className="flex-grow bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">

      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-48 pb-20 sm:pb-28 lg:pb-36">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/6 rounded-full blur-2xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-600/5 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
          />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 text-center flex flex-col items-center justify-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider mb-8 sm:mb-10">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Hybrid Launch Ceremony & Hackathon 2026
          </div>

          {/* Hero heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-[1.15] mb-8 text-center">
            Unveiling the Future of
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent mt-1.5">
              Digital Governance
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-12 text-center">
            Join India&apos;s premier hybrid software hackathon. Connect with VIPs, industry mentors, and the brightest developer minds across the nation.
          </p>

          {/* Info chips */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            {[
              { icon: Calendar, text: 'July 10–12, 2026' },
              { icon: MapPin, text: 'Vigyan Bhawan, New Delhi' },
              { icon: Users, text: '1000+ Participants' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800/80 text-slate-200 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-lg">
                <Icon className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full sm:w-auto">
            <Link
              href="/event/rsvp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 sm:py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>RSVP Invitation</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 sm:py-4.5 border border-slate-700 hover:border-slate-650 bg-slate-900/50 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>Register for Hackathon</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          STATS STRIP
          ═══════════════════════════════════ */}
      <section className="border-y border-slate-800/40 bg-slate-950/40 py-16 sm:py-24">
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '3', label: 'Evaluation Rounds', icon: Trophy },
              { value: '48h', label: 'Hackathon Duration', icon: Clock },
              { value: '₹10L+', label: 'Prize Pool', icon: Star },
              { value: '100%', label: 'Online Ready', icon: Zap },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-slate-900/20 border border-slate-850 rounded-2xl p-8 sm:p-10 text-center space-y-3 hover:bg-slate-900/30 transition-all duration-300">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">{value}</p>
                <p className="text-sm text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          COUNTDOWN & STREAM
          ═══════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-[1400px] mx-auto px-6 space-y-6 sm:space-y-8">

          {/* Countdown */}
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800/80 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-wider">Countdown to Launch</h3>
              </div>
              <p className="text-slate-400 text-sm max-w-md">Join the national digital transformation launch event at Vigyan Bhawan, New Delhi.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {countdownUnits.map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-4 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-16 h-16 sm:w-22 sm:h-22 rounded-2xl bg-slate-950 border border-slate-800 text-2xl sm:text-4xl font-black text-blue-400 tabular-nums shadow-2xl">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-500 mt-2.5">{unit.label}</span>
                  </div>
                  {i < countdownUnits.length - 1 && (
                    <span className="text-slate-800 text-2xl font-bold hidden xs:inline pb-6">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Embed */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative aspect-video">
            {!playStream ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 p-6 text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-400 py-1 px-3 rounded-full text-xs font-bold uppercase">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live Broadcast Offline
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-1">Stream starts July 10, 09:30 AM IST</h4>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto">Watch keynotes, technology demos, and launch cues live from Vigyan Bhawan.</p>
                </div>
                <button
                  onClick={() => setPlayStream(true)}
                  className="flex items-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Preview Stream
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
        </div>
      </section>

      {/* ═══════════════════════════════════
          HACKATHON ROUNDS
          ═══════════════════════════════════ */}
      <section className="section-py border-t border-slate-800/60 bg-slate-900/10">
        <div className="w-full max-w-[1400px] mx-auto px-6 animate-fade-in">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
              <Shield className="w-4 h-4" />
              Evaluation Structure
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              3-Round Judging Timeline
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
              Our hackathon follows a structured 3-round evaluation. Ensure your team submits prototypes before each checkpoint.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {rounds.map((round, i) => {
              const colors = ROUND_COLORS[i % ROUND_COLORS.length];
              return (
                <div
                  key={round.id || round.round_number}
                  className={`relative h-full bg-slate-900/30 border border-slate-800 ${colors.border} rounded-3xl p-8 sm:p-10 flex flex-col gap-6 hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-300 group overflow-hidden shadow-lg`}
                >
                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.bg}`} />

                  {/* Round label + timeline stacked */}
                  <div className="flex flex-col gap-1">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit ${colors.badge}`}>
                      Round {round.round_number}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug break-words">{round.timeline}</p>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-blue-300 transition-colors duration-200">
                      {round.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {round.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 mt-auto">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-0.5">Checkpoint Date</p>
                    <p className="text-xs sm:text-sm text-slate-300 font-semibold break-words">{round.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          AGENDA & SPEAKERS
          ═══════════════════════════════════ */}
      <section className="section-py border-t border-slate-800/60">
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Agenda — 3 cols */}
            <div className="lg:col-span-3 space-y-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  Day Schedule
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Official Agenda</h2>
                <p className="text-slate-550 text-sm">Time schedule for the inaugural day — subject to change.</p>
              </div>

              <div className="relative pl-10">
                {/* Vertical timeline line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-slate-700/50 to-transparent" />

                <div className="space-y-6">
                  {agenda.map((item, idx) => {
                    const typeStyle = AGENDA_TYPE_STYLES[item.type] || AGENDA_TYPE_STYLES.session;
                    return (
                      <div key={idx} className="relative flex gap-4 sm:gap-6">
                        {/* Dot — positioned on the left track */}
                        <div className="absolute -left-10 flex-shrink-0 flex items-start pt-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 z-10
                            ${item.type === 'keynote' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : item.type === 'break' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-blue-500/20 border-blue-500/50 text-blue-400'}`}>
                            {idx + 1}
                          </div>
                        </div>

                        {/* Content card */}
                        <div className="flex-grow min-w-0 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/45 transition-colors">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              {item.time}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${typeStyle}`}>
                              {item.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-white leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 truncate">{item.speaker}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Speakers — 2 cols */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">
                  <Users className="w-4 h-4" />
                  Keynote Speakers
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Distinguished Guests</h2>
                <p className="text-slate-550 text-sm">Dignitaries conducting keynotes and panels.</p>
              </div>

              <div className="space-y-6">
                {speakers.map((sp, idx) => (
                  <div
                    key={idx}
                    className="flex gap-5 bg-slate-900/30 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 group"
                  >
                    <img
                      src={sp.image}
                      alt={sp.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-700 flex-shrink-0 group-hover:border-slate-600 transition-colors"
                      loading="lazy"
                    />
                    <div className="min-w-0 space-y-1.5 pt-1">
                      <h4 className="font-bold text-base sm:text-lg text-white truncate">{sp.name}</h4>
                      <p className="text-[11px] sm:text-xs text-blue-400 font-bold uppercase tracking-wide leading-tight">{sp.role}</p>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">{sp.bio}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-800/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Ready to Compete?</h4>
                <p className="text-xs text-slate-450 leading-relaxed">Register your team and start building your prototype.</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Create Account <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          PRESS KIT CTA
          ═══════════════════════════════════ */}
      <section className="section-py border-t border-slate-800/60 bg-slate-900/10">
        <div className="w-full max-w-[1400px] mx-auto px-6 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
              <Volume2 className="w-4 h-4" />
              Official Media
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Media & Press Assets</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Download embargoed press releases, official photos, speaker bios, and stage itineraries in the digital press kit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/event/press"
                className="inline-flex items-center justify-center gap-2 py-3 px-8 border border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md"
              >
                <Volume2 className="w-4.5 h-4.5 text-blue-400" />
                Access Digital Press Kit
              </Link>
              <Link
                href="/hackathon/leaderboard"
                className="inline-flex items-center justify-center gap-2 py-3 px-8 border border-amber-800/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 hover:text-amber-300 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md"
              >
                <Trophy className="w-4.5 h-4.5" />
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
