'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, Clock, MapPin, Users, ChevronDown, Trophy, Zap, 
  Shield, Star, Award, ArrowRight, Brain, Cpu, Globe, Building2, Map
} from 'lucide-react';

const HACKATHON_THEMES = [
  {
    icon: Brain,
    title: 'AI & Intelligent Systems',
    desc: 'Harness the power of Generative AI, LLMs, NLP, and computer vision to solve complex real-world problems and automate human cognitive tasks.',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    category: 'Software Track',
    difficulty: 'Advanced'
  },
  {
    icon: Cpu,
    title: 'Smart Infrastructure & IoT',
    desc: 'Build smart grids, automated logistics, intelligent transport networks, and smart campus automation using IoT-enabled hardware and software protocols.',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    category: 'Hardware & IoT Track',
    difficulty: 'Intermediate'
  },
  {
    icon: Globe,
    title: 'Sustainable Tech & Green Energy',
    desc: 'Develop solutions promoting carbon footprint mitigation, clean energy management, waste recycling, and water preservation techniques.',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    category: 'Socio-Green Track',
    difficulty: 'All Levels'
  },
  {
    icon: Shield,
    title: 'Cybersecurity & Trust Systems',
    desc: 'Innovate secure decentralized ledger networks, cryptography applications, phishing detection systems, and network security protocols.',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    category: 'Web3 & Cyber Track',
    difficulty: 'Advanced'
  },
  {
    icon: Building2,
    title: 'Healthcare & Biotech Innovation',
    desc: 'Design smart health assistance kits, early diagnostic models, digital medical record keepers, and tech enabling accessible rural healthcare.',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    category: 'Biotech Track',
    difficulty: 'Intermediate'
  }
];

const UNIFIED_TIMELINE = [
  { day: 1, time: '08:00 AM - 10:00 AM', title: 'Participant Registration & Kit Collection', desc: 'Arrive at the hacking hall at LPU, check in, collect your developer badges, event kits, and find your designated workspace.' },
  { day: 1, time: '10:00 AM - 11:30 AM', title: 'Grand Inauguration Ceremony', desc: 'Opening remarks from the Arvix Team and university delegates, followed by rules and evaluation briefing.' },
  { day: 1, time: '11:30 AM', title: 'Hacking Phase Starts', desc: 'The 36-hour countdown begins! Teams start brainstorming, developing, and building their innovative prototypes.' },
  { day: 1, time: '04:00 PM - 06:00 PM', title: 'Mentoring Session 1', desc: 'Meet your domain experts and technical advisors to refine your architecture, validate product direction, and address technical blocks.' },
  { day: 2, time: '09:00 AM - 11:00 AM', title: 'Mentoring Session 2 & Progress Review', desc: 'A quick check-in by technical mentors. Show your prototype progress, get guidance on design, integration, and pitch preparation.' },
  { day: 2, time: '04:00 PM', title: 'Hacking Ends & Final Code Submission', desc: 'Hands off keyboard! Teams submit their repository links, hosting URLs, and summary documents through the submission system.' },
  { day: 2, time: '04:30 PM - 06:30 PM', title: 'Grand Pitching & Jury Evaluation', desc: 'Live project demos! Each team presents their functional prototype to our distinguished jury panel followed by Q&A.' },
  { day: 2, time: '07:00 PM - 08:00 PM', title: 'Award Ceremony & Valedictory', desc: 'Announcing winners, distributing cash rewards, certificates, cloud credits, and concluding closing statements.' }
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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-36 sm:pt-44 lg:pt-48 pb-24 sm:pb-32 lg:pb-36">
        {/* Glowing backdrops & grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 grid-overlay opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
        </div>

        <div className="relative w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20 z-10">
          <div className="flex flex-col items-center text-center space-y-14">
            
            {/* Centered Text Content */}
            <div className="space-y-8 flex flex-col items-center max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>Registrations are Live</span>
              </div>

              <h1 className="hero-heading tracking-tight text-white leading-tight">
                ARVIX NEXUS 2026 <br/>
                <span className="gradient-text-accent">National Level</span> <br/>
                Innovation Hackathon
              </h1>

              <p className="body-text max-w-[700px] text-slate-350 mx-auto">
                Join India's premier innovation battleground at Lovely Professional University. Unleash your technical prowess, build real-world software solutions, and compete with elite developers nationwide.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { icon: Calendar, text: 'September 3 – 4, 2026', color: 'text-primary' },
                  { icon: MapPin, text: 'LPU Jalandhar, Punjab', color: 'text-secondary' },
                  { icon: Users, text: 'Teams of 1–4 Members', color: 'text-emerald-400' },
                  { icon: Award, text: 'Free Registration', color: 'text-amber-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center justify-center gap-2.5 bg-surface/60 border border-white/5 text-slate-300 px-4.5 py-3 rounded-2xl text-sm font-semibold shadow-sm">
                      <Icon className={`w-4.5 h-4.5 ${item.color} flex-shrink-0`} />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Centered */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
                <a
                  href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Register Now (Free)</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4.5 border border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 hover:text-white rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Explore Themes</span>
                </a>
              </div>
            </div>

            {/* Venue & Host Cards Centered Row */}
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl pt-8">
              <div className="glass-card card-padding gradient-border-glow animate-float flex-1 min-w-[300px] flex flex-col items-center text-center">
                <Star className="w-6 h-6 text-warning mb-3 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Venue & Host</span>
                <h3 className="text-xl font-extrabold text-white leading-tight">Lovely Professional University</h3>
                <p className="text-xs text-slate-400 mt-2">Grand Trunk Road, Phagwara, Punjab, India.</p>
              </div>

              <div className="glass-card card-padding gradient-border-glow animate-float-delayed flex-1 min-w-[300px] flex flex-col items-center text-center">
                <Trophy className="w-6 h-6 text-secondary mb-3" />
                <h4 className="text-xl font-extrabold text-white mb-2">Innovation Battle</h4>
                <p className="text-xs text-slate-400 mb-3">Cash prizes, certificates & developer goodies</p>
                <span className="bg-primary/10 text-primary border border-primary/15 px-3 py-1 rounded-full font-bold text-xs mt-1">36 Hours (Continuous)</span>
              </div>
            </div>

          </div>

          {/* Trust Indicators Grid */}
          <div className="pt-16 mt-8 border-t border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center max-w-5xl mx-auto">
              {[
                { value: '5000+', label: 'Expected Participants' },
                { value: '100+', label: 'Colleges Represented' },
                { value: '36 Hours', label: 'Continuous Coding' },
                { value: '₹5,00,000', label: 'Prize Pool Value' },
                { value: '50+', label: 'Expert Tech Mentors' }
              ].map((stat, i) => (
                <div key={i} className="space-y-1 py-4 px-2 glass-card border border-white/5 bg-surface/20 premium-hover-lift">
                  <span className="block text-2xl md:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stat.value}</span>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Countdown section */}
      <section className="relative z-10 w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20 mb-16">
        <div className="glass-card gradient-border-glow p-8 md:p-12 flex flex-col items-center text-center gap-8 bg-surface/40 max-w-5xl mx-auto">
          <div className="space-y-3 max-w-2xl flex flex-col items-center">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="text-base font-extrabold text-white uppercase tracking-widest">Time Remaining Until Kickoff</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Registrations are open but seats are limited. Secure your team slot today to avoid missing out on this major event.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {countdownUnits.map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface border border-white/5 text-3xl sm:text-4xl font-extrabold text-primary tabular-nums shadow-inner">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-slate-500 mt-3">{unit.label}</span>
                </div>
                {i < countdownUnits.length - 1 && (
                  <span className="text-slate-700 text-3xl font-bold hidden xs:inline pb-8">:</span>
                )}
              </div>
            ))}
          </div>

          <a
            href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/5 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-primary rounded-xl font-bold text-sm transition-all"
          >
            Claim Your Spot Before Time Runs Out
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-py relative z-10 border-t border-white/5">
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex flex-col items-center text-center space-y-16 max-w-5xl mx-auto">
            
            <div className="space-y-6 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                <Zap className="w-4 h-4" />
                <span>The Nexus of Innovation</span>
              </div>
              <h2 className="section-heading text-white">About ARVIX NEXUS 2026</h2>
              <p className="body-text text-slate-350 leading-relaxed max-w-[800px] mx-auto">
                ARVIX NEXUS 2026 is India's premier national-level innovation hackathon, bringing together the country's most talented developers, designers, and creators. Hosted at Lovely Professional University, this 36-hour sprint challenges participants to solve real-world problems through cutting-edge technology.
              </p>
            </div>

            {/* Centered Statistics visual cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {[
                { title: '36 Hours', desc: 'Continuous Coding & Rapid Prototyping', color: 'text-primary border-primary/10' },
                { title: 'National Level', desc: 'Compete with elite student minds pan-India', color: 'text-purple-400 border-purple-500/10' },
                { title: '1-4 Members', desc: 'Collaborative squads with cross-functional talent', color: 'text-emerald-400 border-emerald-500/10' },
                { title: 'Free Registration', desc: 'No fees required, with full hospitality provided', color: 'text-amber-400 border-amber-500/10' },
                { title: 'Expert Mentors', desc: '1-on-1 guidance from tech leaders and architects', color: 'text-blue-400 border-blue-500/10' },
                { title: 'Industry Jury', desc: 'Projects evaluated by senior engineers and founders', color: 'text-rose-400 border-rose-500/10' }
              ].map((stat, i) => (
                <div key={i} className={`glass-card p-6 border flex flex-col items-center text-center justify-center space-y-3 premium-hover-lift ${stat.color}`}>
                  <h4 className="text-xl font-black text-white leading-tight">{stat.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <a
                href="#themes"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
              >
                <span>View Hackathon Themes</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section id="themes" className="section-py relative z-10 bg-surface/30 border-y border-white/5">
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex flex-col items-center text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <Cpu className="w-4 h-4" />
              <span>Hacking Themes</span>
            </div>
            <h2 className="section-heading text-white">Innovation Tracks</h2>
            <p className="body-text text-slate-350 mx-auto">
              Choose from our curated themes and build software or hardware prototypes that create a positive, scalable impact on society.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {HACKATHON_THEMES.map((theme, i) => {
              const Icon = theme.icon;
              return (
                <div key={i} className="glass-card p-8 border border-white/5 flex flex-col items-center text-center space-y-6 hover:border-primary/30 transition-all duration-300 group premium-hover-lift h-full justify-center">
                  <div className="flex flex-col items-center space-y-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">{theme.category}</span>
                    </div>

                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${theme.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    
                    <h3 className="card-title text-white group-hover:text-primary transition-colors duration-300 leading-tight">{theme.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed px-2">{theme.desc}</p>

                    <div className="pt-2">
                      <span className="text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Difficulty: {theme.difficulty}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex justify-center">
            <a
              href="#timeline"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
            >
              <span>View Event Schedule</span>
              <Clock className="w-4 h-4 text-primary" />
            </a>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="section-py relative z-10">
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex flex-col items-center text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <Clock className="w-4 h-4" />
              <span>Event Schedule</span>
            </div>
            <h2 className="section-heading text-white">Itinerary Timeline</h2>
            <p className="body-text text-slate-350 mx-auto">
              Review our schedule outlines to ensure your team hits all checkpoints, mentoring rounds, and final pitching reviews.
            </p>
          </div>

          {/* Fully Centered Vertical Timeline */}
          <div className="relative space-y-8 max-w-3xl mx-auto flex flex-col items-center">
            {/* The vertical connector line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-secondary to-primary opacity-30 rounded-full" />

            {UNIFIED_TIMELINE.map((item, idx) => {
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center w-full group">
                  {/* Timeline Node */}
                  <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(79,124,255,0.5)] group-hover:scale-110 transition-transform mb-6 z-20">
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  
                  {/* Timeline Card - Center aligned */}
                  <div className="w-full glass-card p-8 border border-white/5 flex flex-col items-center text-center premium-hover-lift bg-surface/80">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 border border-primary/25 px-3 py-1 rounded-full">{item.time}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase bg-white/5 px-3 py-1 rounded-full">Day {item.day}</span>
                    </div>
                    <h4 className="text-xl font-extrabold text-white mb-3 leading-snug">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex justify-center">
            <a
              href="#venue"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
            >
              <span>View Venue Details</span>
              <MapPin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section id="venue" className="section-py relative z-10 bg-surface/20 border-t border-white/5">
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex flex-col items-center text-center space-y-14 max-w-4xl mx-auto">
            
            <div className="space-y-6 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                <MapPin className="w-4 h-4" />
                <span>Location Details</span>
              </div>
              <h2 className="section-heading text-white">The Campus Venue</h2>
              <p className="body-text text-slate-350 leading-relaxed mx-auto">
                ARVIX NEXUS 2026 is hosted on-site at <strong>Lovely Professional University (LPU)</strong>, one of India's largest and most technologically advanced campuses.
              </p>
            </div>

            {/* Venue Location Grid - Centered items */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
              <div className="glass-card p-6 flex flex-col items-center text-center w-full md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Full Address</h4>
                <p className="text-sm text-slate-400">Lovely Professional University, Grand Trunk Road, Phagwara, Punjab, 144411, India.</p>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center w-full md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Map className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">How to Reach</h4>
                <p className="text-sm text-slate-400">Easily accessible by train via Phagwara Junction or Jalandhar City Railway Stations on NH-1.</p>
              </div>
            </div>

            <div className="w-full max-w-4xl pt-4">
              <div className="glass-card overflow-hidden gradient-border-glow p-4 shadow-2xl relative">
                <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-slate-950/70 z-10 flex flex-col items-center justify-center text-center p-8 space-y-6">
                    <MapPin className="w-16 h-16 text-primary animate-bounce" />
                    <div>
                      <h4 className="text-2xl font-black text-white">Lovely Professional University</h4>
                      <p className="text-sm text-slate-450 mt-2">Phagwara, Punjab, India</p>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Lovely+Professional+University"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-4 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105"
                    >
                      <span>Open in Google Maps</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="absolute inset-0 opacity-15"
                    style={{ backgroundImage: 'radial-gradient(rgba(79, 124, 255, 0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-center w-full">
              <a
                href="#faqs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
              >
                <span>Read the FAQs</span>
                <Shield className="w-4 h-4 text-primary" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="section-py relative z-10 border-t border-white/5 bg-surface/10">
        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex flex-col items-center text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <Shield className="w-4 h-4" />
              <span>Got Questions?</span>
            </div>
            <h2 className="section-heading text-white">Frequently Asked Questions</h2>
            <p className="body-text text-slate-350 mx-auto">
              Find answers to general questions regarding registration, guidelines, and what to expect during the event.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
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
                    className="w-full p-6 sm:p-8 flex items-center justify-between text-left gap-6"
                  >
                    <h4 className="text-base sm:text-lg font-bold text-white pr-4">{item.q}</h4>
                    <ChevronDown
                      className={`w-6 h-6 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[300px] border-t border-white/5' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <div className="p-6 sm:p-8 bg-bg-primary/30 text-sm sm:text-base text-slate-400 leading-relaxed text-left">
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Registration Section (Redesigned visual CTA block) */}
      <section className="section-py relative z-10 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[1280px] mx-auto px-8 md:px-16 lg:px-20 relative z-10">
          <div className="glass-card p-10 md:p-20 text-center max-w-5xl mx-auto relative overflow-hidden bg-gradient-to-r from-surface/80 to-slate-900/80 border border-white/5 flex flex-col items-center">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-shift" />

            <div className="max-w-3xl mx-auto space-y-10 flex flex-col items-center">
              <Trophy className="w-20 h-20 text-warning mx-auto animate-bounce" />
              
              <div className="space-y-6 flex flex-col items-center">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">Join the Hacking Nexus!</h2>
                <p className="text-slate-350 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                  Registrations are free and fully managed on KonfHub. Form your team of 1–4, choose your track, and prepare to code.
                </p>
              </div>

              {/* Benefits Checklist Grid Centered */}
              <div className="flex flex-wrap justify-center gap-6 py-4">
                {[
                  'Free Registration',
                  'Limited Seats',
                  'Certificates for All',
                  'Cash Prize Pool',
                  'Industry Recognition'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm font-semibold text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-success flex-shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 w-full flex justify-center">
                <a
                  href="https://konfhub.com/arvix-nexus-2026-national-level-innovation-hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                >
                  <span>Register Now on KonfHub</span>
                  <ArrowRight className="w-6 h-6" />
                </a>
              </div>

              {/* Organizing details Centered */}
              <div className="pt-12 mt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-10 w-full">
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Organizer</span>
                  <span className="text-sm font-bold text-slate-200">Arvix Team</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Support Email</span>
                  <a href="mailto:sujithlavudu@gmail.com" className="text-sm font-bold text-primary hover:underline">sujithlavudu@gmail.com</a>
                </div>
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Support Phone</span>
                  <a href="tel:+917331161928" className="text-sm font-bold text-slate-200">+91-7331161928</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
