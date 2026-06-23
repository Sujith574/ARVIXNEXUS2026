'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, MapPin, Play, Radio, Users, ChevronRight, Volume2, Share2 } from 'lucide-react';

const DEFAULT_AGENDA = [
  { time: '09:00 AM', title: 'Delegate Registration & Welcome', speaker: 'Reception Desk', type: 'session' },
  { time: '10:00 AM', title: 'Inaugural Address & National Launch', speaker: 'Hon’ble Minister, MeitY', type: 'keynote' },
  { time: '11:15 AM', title: 'Unveiling of the Digital Stack 2026', speaker: 'MeitY Secretary & Tech Leads', type: 'keynote' },
  { time: '12:00 PM', title: 'Panel: Scaling AI in Public Service Delivery', speaker: 'Industry Experts & Senior IAS Officers', type: 'session' },
  { time: '01:00 PM', title: 'Networking Lunch & Media Interaction', speaker: 'All Delegates', type: 'break' },
  { time: '02:00 PM', title: 'National Hackathon Opening Ceremony', speaker: 'Hackathon Organizing Committee', type: 'session' }
];

const DEFAULT_SPEAKERS = [
  { name: 'Shri Ashwini Vaishnaw', role: 'Hon’ble Minister for Railways, Communications, Electronics & IT', bio: 'Leading the digital transformation initiatives, electronics manufacturing, and tech innovation frameworks across the nation.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face' },
  { name: 'Dr. Neeta Verma', role: 'Director General, National Informatics Centre', bio: 'Pioneered government cloud deployment and mobile-first citizen services across Indian districts.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face' },
  { name: 'Dr. Rajendra Kumar, IAS', role: 'Additional Secretary, MeitY', bio: 'Expert in e-governance policies, public service delivery models, and emerging technologies integration.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
];

export default function EventLandingPage() {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [playStream, setPlayStream] = useState(false);
  const supabase = createClient();

  // Set event date for July 10, 2026
  const eventDate = new Date('2026-07-10T09:00:00+05:30').getTime();

  useEffect(() => {
    // 1. Fetch agenda & speakers from MongoDB API
    const fetchEventData = async () => {
      try {
        const res = await fetch('/api/event/landing');
        if (!res.ok) throw new Error('Failed to fetch event data');
        const data = await res.json();

        if (data.agenda && data.agenda.length > 0) {
          // Map database records to timeline format
          const formatted = data.agenda.map((item: any) => {
            const start = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              time: start,
              title: item.title,
              speaker: item.speaker?.full_name || item.description || 'Guest Speaker',
              type: item.type
            };
          });
          setAgenda(formatted);
        } else {
          setAgenda(DEFAULT_AGENDA);
        }

        if (data.speakers && data.speakers.length > 0) {
          const mappedSpeakers = data.speakers.map((s: any) => ({
            name: s.full_name,
            role: s.linkedin || 'Senior Tech Lead, MeitY',
            bio: s.skills && s.skills.length > 0 ? `Expertise in ${s.skills.join(', ')}` : 'Dedicated to building national digital infrastructure and scaling tech innovation.',
            image: s.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }));
          setSpeakers(mappedSpeakers);
        } else {
          setSpeakers(DEFAULT_SPEAKERS);
        }

        if (data.rounds && data.rounds.length > 0) {
          setRounds(data.rounds);
        } else {
          setRounds([
            { round_number: 1, title: 'Ideation & Stack Submission', date: 'July 10, 2026', timeline: '02:00 PM - 06:00 PM', description: 'Teams register, submit stacks, and pitch core ideas to review panels.' },
            { round_number: 2, title: 'Prototype Evaluation', date: 'July 11, 2026', timeline: '10:00 AM - 05:00 PM', description: 'Mid-point checkin with technical mentors and initial scoring.' },
            { round_number: 3, title: 'Grand Finale Pitching', date: 'July 12, 2026', timeline: '09:00 AM - 04:00 PM', description: 'Working prototypes presented to VIP guest panel for final grading.' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setAgenda(DEFAULT_AGENDA);
        setSpeakers(DEFAULT_SPEAKERS);
        setRounds([
          { round_number: 1, title: 'Ideation & Stack Submission', date: 'July 10, 2026', timeline: '02:00 PM - 06:00 PM', description: 'Teams register, submit stacks, and pitch core ideas to review panels.' },
          { round_number: 2, title: 'Prototype Evaluation', date: 'July 11, 2026', timeline: '10:00 AM - 05:00 PM', description: 'Mid-point checkin with technical mentors and initial scoring.' },
          { round_number: 3, title: 'Grand Finale Pitching', date: 'July 12, 2026', timeline: '09:00 AM - 04:00 PM', description: 'Working prototypes presented to VIP guest panel for final grading.' }
        ]);
      }
    };

    fetchEventData();

    // 2. Countdown timer loop
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <div className="flex-grow bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 border-b border-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.2),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5" /> Hybrid Launch Ceremony & Hackathon 2026
          </div>

          <h1 className="text-4xl font-extrabold sm:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Unveiling the Future of{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
              Digital Governance
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join the central government ceremony and pitch your solutions in India’s premier hybrid software hackathon. Connect with VIPs, industry mentors, and peers.
          </p>

          {/* Quick info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4 text-sm font-semibold text-slate-350">
            <div className="flex items-center justify-center gap-2.5 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>July 10-12, 2026</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span>Vigyan Bhawan, New Delhi + Online</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
              <Users className="w-5 h-5 text-blue-500" />
              <span>1000+ Participants</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/event/rsvp"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-blue-550/10 transition-all flex items-center justify-center gap-1.5"
            >
              <span>RSVP Invitation</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center"
            >
              Register for Hackathon
            </Link>
          </div>

        </div>
      </section>

      {/* Live Countdown & Broadcast */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Countdown Dials */}
        <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-1.5">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-blue-500" /> Countdown to Launch
            </h3>
            <p className="text-slate-400 text-xs">Vigyan Bhawan Inaugural session starts in New Delhi.</p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.minutes },
              { label: 'Secs', value: timeLeft.seconds }
            ].map((unit, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950 border border-slate-850 text-xl sm:text-2xl font-extrabold text-blue-400 shadow-md">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-2">{unit.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Embed Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
          {!playStream ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10 p-6 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/50 text-rose-400 py-1 px-3 rounded-full text-xs font-semibold uppercase">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Broadcast Offline
              </div>
              <h4 className="text-xl font-bold text-white">Stream starts July 10, 09:30 AM IST</h4>
              <p className="text-slate-505 text-sm max-w-sm">Watch the keynotes, technology demonstrations, and launch cues live from Vigyan Bhawan.</p>
              <button
                onClick={() => setPlayStream(true)}
                className="flex items-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Preview Stream Frame</span>
              </button>
            </div>
          ) : (
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&mute=1"
              title="Government Launch Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </section>

      {/* Hackathon Evaluation Rounds Section */}
      <section className="py-16 bg-slate-900/10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold sm:text-3xl text-white tracking-tight">
              Evaluation & Judging Timeline
            </h3>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Our software development hackathon is structured into 3 competitive rounds. Ensure your team submits prototypes before the evaluation checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rounds.map((round) => (
              <div
                key={round.id || round.round_number}
                className="bg-slate-900/30 p-6 rounded-2xl border border-slate-850 hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Decorative border highlight */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20">
                      Round {round.round_number}
                    </span>
                    <span className="text-[10px] text-slate-550 font-semibold">{round.timeline}</span>
                  </div>
                  
                  <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                    {round.title}
                  </h4>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {round.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-850/50 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                  <span>Checkpoint Date</span>
                  <span className="text-slate-350">{round.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Agenda & Speaker Roster Grid */}
      <section className="py-16 bg-slate-900/10 border-t border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Agenda Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Official Agenda</h3>
              <p className="text-slate-400 text-xs mt-1">Time schedule for the inaugural day, subject to change.</p>
            </div>

            <div className="relative border-l border-slate-800 ml-3.5 space-y-6 pl-6 pt-2">
              {agenda.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-10 top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border border-slate-850 text-[10px] font-bold text-blue-400">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" /> {item.time}
                    </span>
                    <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.speaker}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speakers Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Distinguished Speakers</h3>
              <p className="text-slate-400 text-xs mt-1">Dignitaries conducting keynotes and panels.</p>
            </div>

            <div className="space-y-4">
              {speakers.map((sp, idx) => (
                <div key={idx} className="bg-slate-900/30 p-4 rounded-xl border border-slate-850 flex gap-4 hover:border-slate-750 transition-colors">
                  <img src={sp.image} alt={sp.name} className="w-12 h-12 rounded-full border border-slate-800 object-cover" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-white">{sp.name}</h4>
                    <p className="text-[10px] text-blue-400 font-bold uppercase">{sp.role}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{sp.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Press Kit callout */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-blue-950/20 to-indigo-950/20 rounded-3xl border border-slate-900 shadow-xl space-y-6">
        <h3 className="text-2xl font-bold text-white">Official Media & Press Assets</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Download embargoed press releases, official media photos, speaker bios, and stage itineraries in the digital press kit.
        </p>
        <Link
          href="/event/press"
          className="inline-flex items-center gap-1.5 py-2.5 px-6 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-white rounded-lg text-sm font-semibold transition-all"
        >
          <Volume2 className="w-4 h-4 text-blue-500" />
          <span>Access Digital Press Kit</span>
        </Link>
      </section>

    </div>
  );
}
