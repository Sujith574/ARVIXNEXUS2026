'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, Clock, MapPin, Users, ChevronDown, Trophy, Zap, 
  Shield, Star, Award, ArrowRight, Brain, Cpu, Globe, Building2
} from 'lucide-react';

const HACKATHON_THEMES = [
  {
    icon: Brain,
    title: 'AI & Intelligent Systems',
    desc: 'Harness the power of Generative AI, LLMs, NLP, and computer vision to solve complex real-world problems and automate human cognitive tasks.',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    icon: Cpu,
    title: 'Smart Infrastructure & IoT',
    desc: 'Build smart grids, automated logistics, intelligent transport networks, and smart campus automation using IoT-enabled hardware and software protocols.',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: Globe,
    title: 'Sustainable Tech & Green Energy',
    desc: 'Develop solutions promoting carbon footprint mitigation, clean energy management, waste recycling, and water preservation techniques.',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: Shield,
    title: 'Cybersecurity & Trust Systems',
    desc: 'Innovate secure decentralized ledger networks, cryptography applications, phishing detection systems, and network security protocols.',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  },
  {
    icon: Building2,
    title: 'Healthcare & Biotech Innovation',
    desc: 'Design smart health assistance kits, early diagnostic models, digital medical record keepers, and tech enabling accessible rural healthcare.',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  }
];

const SCHEDULE_DAY_1 = [
  { time: '08:00 AM - 10:00 AM', title: 'Participant Registration & Kit Collection', desc: 'Arrive at the hacking hall at LPU, check in, collect your developer badges, event kits, and find your designated workspace.' },
  { time: '10:00 AM - 11:30 AM', title: 'Grand Inauguration Ceremony', desc: 'Opening remarks from the Arvix Team and university delegates, followed by rules and evaluation briefing.' },
  { time: '11:30 AM', title: 'Hacking Phase Starts', desc: 'The 36-hour countdown begins! Teams start brainstorming, developing, and building their innovative prototypes.' },
  { time: '04:00 PM - 06:00 PM', title: 'Mentoring Session 1', desc: 'Meet your domain experts and technical advisors to refine your architecture, validate product direction, and address technical blocks.' }
];

const SCHEDULE_DAY_2 = [
  { time: '09:00 AM - 11:00 AM', title: 'Mentoring Session 2 & Progress Review', desc: 'A quick check-in by technical mentors. Show your prototype progress, get guidance on design, integration, and pitch preparation.' },
  { time: '04:00 PM', title: 'Hacking Ends & Final Code Submission', desc: 'Hands off keyboard! Teams submit their repository links, hosting URLs, and summary documents through the submission system.' },
  { time: '04:30 PM - 06:30 PM', title: 'Grand Pitching & Jury Evaluation', desc: 'Live project demos! Each team presents their functional prototype to our distinguished jury panel followed by Q&A.' },
  { time: '07:00 PM - 08:00 PM', title: 'Award Ceremony & Valedictory', desc: 'Announcing winners, distributing cash rewards, certificates, cloud credits, and concluding closing statements.' }
];

const FAQ_ITEMS = [
  {
    q: 'Who is eligible to participate?',
    a: 'Students, young developers, UI/UX designers, and tech enthusiasts from universities across India are eligible to form a team and participate.'
  },
  {
    q: 'What is the team size requirement?',
    a: 'Teams can consist of 1 to 4 members. We encourage cross-functional teams with developers, designers, and domain thinkers.'
  },
  {
    q: 'Is there a registration fee?',
    a: 'No, registration is completely free. However, since seats are limited, registration and confirmation via KonfHub are mandatory.'
  },
  {
    q: 'What facilities will be provided at LPU?',
    a: 'Lovely Professional University will provide high-speed campus Wi-Fi, air-conditioned hacking spaces, power sockets at each desk, resting rooms, and meals (breakfast, lunch, dinner, snacks, and midnight coffee) during the hackathon.'
  },
  {
    q: 'What should we bring with us?',
    a: 'All participants must bring their laptops, chargers, extension boxes, physical college/govt IDs, and personal items like toiletries or medicines if they plan to stay overnight.'
  }
];

export default function EventLandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);

  const eventDate = new Date('2026-09-03T09:00:00+05:30').getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const diff = eventDate - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const countdownUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="flex-grow bg-bg-primary text-slate-100 flex flex-col overflow-x-hidden">
      
      <section className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-24 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-[90px] animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>Registrations are Live</span>
              </div>

              <h1 className="hero-heading tracking-tight text-white leading-none">
                ARVIX NEXUS 2026 <br/>
                <span className="gradient-text-accent">National Level</span> <br/>
                Innovation Hackathon
              </h1>

              <p className="body-text max-w-2xl text-slate-300">
                Join India's premier innovation battleground at Lovely Professional University. Unleash your technical prowess, build real-world software solutions, and compete with elite developers nationwide.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { icon: Calendar, text: 'September 3 – 4, 2026', color: 'text-primary' },
                  { icon: MapPin, text: 'LPU Jalandhar, Punjab', color: 'text-secondary' },
                  { icon: Users, text: 'Teams of 1–4 Members', color: 'text-emerald-400' },
                  { icon: Award, text: 'Free Registration', color: 'text-amber-400' },
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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Register Now (Free)</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4.5 border border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Learn More</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full filter blur-3xl opacity-60 z-0 pointer-events-none" />

              <div className="relative z-10 w-full max-w-[440px] space-y-6">
                
                <div className="glass-card card-padding gradient-border-glow animate-float">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Venue & Host</span>
                    <Star className="w-4 h-4 text-warning animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white leading-tight">Lovely Professional University</h3>
                  <p className="text-xs text-slate-400 mt-1.5">Lovely Professional University (LPU), Grand Trunk Road, Phagwara, Punjab, India.</p>
                </div>

                <div className="glass-card card-padding gradient-border-glow animate-float-delayed">
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Innovation Battle</h4>
                      <p className="text-xs text-slate-400">Cash prizes, certificates & developer goodies</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/5 my-3" />
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Duration:</span>
                    <span className="bg-primary/10 text-primary border border-primary/15 px-2.5 py-0.5 rounded-full font-bold">36 Hours (Continuous)</span>
                  </div>
                </div>

                <div className="glass-card p-5 gradient-border-glow flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Calendar className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Hackathon Launch</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">September 3, 2026 @ 09:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 mb-16">
        <div className="glass-card gradient-border-glow p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left space-y-2 max-w-md">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="text-base font-extrabold text-white uppercase tracking-widest">Time Remaining Until Kickoff</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Registrations are open but seats are limited. Secure your team slot today to avoid missing out on this major event.
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

      <section id="about" className="section-py relative z-10 border-t border-white/5">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Zap className="w-4 h-4" />
                <span>The Nexus of Innovation</span>
              </div>
              <h2 className="section-heading text-white">About ARVIX NEXUS 2026</h2>
              <p className="body-text text-slate-300 leading-relaxed">
                ARVIX NEXUS 2026 is a national-level innovation hackathon that brings together bright student minds and technical visionaries across the country. Hosted at Lovely Professional University, Phagwara, this 36-hour continuous hackathon provides a platform for teams to address complex real-world challenges.
              </p>
              <p className="body-text text-slate-300 leading-relaxed">
                Whether you want to deploy generative AI, secure systems, smart IoT gadgets, or build green energy technology, this is your canvas. Meet tech mentors, pitch to an esteemed panel of judges, and win exciting cash prizes, goodies, and cloud credits!
              </p>
              
              <div className="pt-2">
                <a
                  href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
                >
                  <span>Register Free on KonfHub</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: '36 Hours', desc: 'Continuous Coding, Brainstorming & Development', color: 'text-primary border-primary/20' },
                { title: 'Elite Jury', desc: 'Evaluated by Senior Architects, Engineers & Founders', color: 'text-purple-400 border-purple-500/20' },
                { title: 'Great Venue', desc: 'Hosted at Lovely Professional University Jalandhar Campus', color: 'text-emerald-400 border-emerald-500/20' },
                { title: 'Free Support', desc: 'Catering, Wi-Fi, Resting Halls & Mentoring Provided', color: 'text-amber-400 border-amber-500/20' }
              ].map((stat, i) => (
                <div key={i} className={`glass-card p-6 border flex flex-col justify-between space-y-3 ${stat.color}`}>
                  <h4 className="text-2xl font-black text-white">{stat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="themes" className="section-py relative z-10 bg-surface/30 border-y border-white/5">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Cpu className="w-4 h-4" />
              <span>Hacking Themes</span>
            </div>
            <h2 className="section-heading text-white">Innovation Tracks</h2>
            <p className="body-text text-slate-350">
              Choose from our curated themes and build software or hardware prototypes that create a positive, scalable impact on society.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HACKATHON_THEMES.map((theme, i) => {
              const Icon = theme.icon;
              return (
                <div key={i} className="glass-card p-6 sm:p-8 border border-white/5 flex flex-col space-y-5 hover:border-primary/30 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme.color} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">{theme.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-grow">{theme.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="timeline" className="section-py relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Clock className="w-4 h-4" />
              <span>Event Schedule</span>
            </div>
            <h2 className="section-heading text-white">Itinerary Timeline</h2>
            <p className="body-text text-slate-350">
              Review our schedule outlines to ensure your team hits all checkpoints, mentoring rounds, and final pitching reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h3 className="text-xl font-extrabold text-white">Day 1 — September 3, 2026</h3>
              </div>
              <div className="space-y-6 relative pl-6 border-l border-white/10 ml-1">
                {SCHEDULE_DAY_1.map((item, idx) => (
                  <div key={idx} className="relative space-y-2">
                    <span className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-primary" />
                    <span className="text-xs font-bold text-primary block">{item.time}</span>
                    <h4 className="text-base font-extrabold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <h3 className="text-xl font-extrabold text-white">Day 2 — September 4, 2026</h3>
              </div>
              <div className="space-y-6 relative pl-6 border-l border-white/10 ml-1">
                {SCHEDULE_DAY_2.map((item, idx) => (
                  <div key={idx} className="relative space-y-2">
                    <span className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-secondary" />
                    <span className="text-xs font-bold text-secondary block">{item.time}</span>
                    <h4 className="text-base font-extrabold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="venue" className="section-py relative z-10 bg-surface/20 border-t border-white/5">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <MapPin className="w-4 h-4" />
                <span>Location Details</span>
              </div>
              <h2 className="section-heading text-white">The Campus Venue</h2>
              <p className="body-text text-slate-350 leading-relaxed">
                ARVIX NEXUS 2026 is hosted on-site at <strong>Lovely Professional University (LPU)</strong>, one of India's largest and most technologically advanced campuses.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Full Address</h4>
                    <p className="text-xs text-slate-400 mt-1">Lovely Professional University, Grand Trunk Road, Phagwara, Punjab, 144411, India.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">How to Reach</h4>
                    <p className="text-xs text-slate-400 mt-1">The university is situated on the NH-1 highway, easily accessible by train via Phagwara Junction (Phagwara) or Jalandhar City Railway Stations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-card overflow-hidden gradient-border-glow p-3 shadow-2xl relative">
                <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-slate-950/70 z-10 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <MapPin className="w-10 h-10 text-primary animate-bounce" />
                    <div>
                      <h4 className="text-lg font-bold text-white">Lovely Professional University</h4>
                      <p className="text-xs text-slate-450 mt-1">Phagwara, Punjab, India</p>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Lovely+Professional+University"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 py-2 px-4 bg-primary hover:opacity-90 text-white rounded-lg font-bold text-xs shadow-md transition-all"
                    >
                      <span>Open in Google Maps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="absolute inset-0 opacity-15"
                    style={{ backgroundImage: 'radial-gradient(rgba(79, 124, 255, 0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faqs" className="section-py relative z-10 border-t border-white/5 bg-surface/10">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Shield className="w-4 h-4" />
              <span>Got Questions?</span>
            </div>
            <h2 className="section-heading text-white">Frequently Asked Questions</h2>
            <p className="body-text text-slate-350">
              Find answers to general questions regarding registration, guidelines, and what to expect during the event.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isExpanded = activeFaqId === idx;
              return (
                <div
                  key={idx}
                  className={`glass-card overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'border-primary/30 bg-surface/60' : 'border-white/5'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaqId(isExpanded ? null : idx)}
                    className="w-full p-6 flex items-center justify-between text-left gap-4"
                  >
                    <h4 className="text-base font-bold text-white">{item.q}</h4>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[200px] border-t border-white/5' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <div className="p-6 bg-bg-primary/30 text-sm text-slate-400 leading-relaxed">
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-py relative z-10 border-t border-white/5 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Trophy className="w-16 h-16 text-warning mx-auto animate-bounce" />
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white">Join the Hacking Nexus!</h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Registrations are free and fully managed on KonfHub. Form your team of 1–4, choose your track, and prepare to code.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <a
                href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Register Now on KonfHub</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Organizing details */}
            <div className="pt-12 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Organizer</span>
                <span className="text-sm font-semibold text-slate-200 font-figtree">Arvix Team</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Support Email</span>
                <a href="mailto:sujithlavudu@gmail.com" className="text-sm font-semibold text-primary hover:underline block break-all font-figtree">sujithlavudu@gmail.com</a>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Support Phone</span>
                <a href="tel:+917331161928" className="text-sm font-semibold text-slate-200 block font-figtree">+91-7331161928</a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
