'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Download, ExternalLink, Code, Database, AlertCircle, Loader2, Award, BookOpen, Layers } from 'lucide-react';

const MOCK_PROBLEMS = [
  {
    id: 'mock-1',
    title: 'AI-Enabled Public Grievance Redressal System',
    track: 'AI for Governance',
    difficulty: 'Hard',
    category: 'Civic Tech',
    description: 'Build a system to automatically categorize, prioritize, and summarize public grievances submitted to the government portals. Integrate sentiment analysis and auto-routing to relevant ministries for rapid resolution.',
    pdf_url: '#',
    api_links: [
      { name: 'CPGRAMS API', url: 'https://cpgrams.gov.in/api-doc' },
      { name: 'Bhashini Translation API', url: 'https://bhashini.gov.in/en/' }
    ]
  },
  {
    id: 'mock-2',
    title: 'Blockchain-Based Land Registry & Smart Contracts',
    track: 'Digital India',
    difficulty: 'Medium',
    category: 'Blockchain',
    description: 'Develop a secure, immutable, and transparent land ownership registry using Distributed Ledger Technology. Design smart contracts for ownership transfers that auto-execute on payment clearance to prevent land frauds.',
    pdf_url: '#',
    api_links: [
      { name: 'India Stack Auth API', url: 'https://indiastack.org/' },
      { name: 'National Map Datasets', url: 'https://bhuvan.nrsc.gov.in/' }
    ]
  },
  {
    id: 'mock-3',
    title: 'IoT-Driven Real-time Air Quality & Traffic Management',
    track: 'Smart Cities',
    difficulty: 'Medium',
    category: 'IoT & Sensors',
    description: 'Integrate real-time feeds from city air quality sensors and traffic cameras. Build an intelligent traffic light control system that optimizes traffic flows dynamically in high pollution hotspots to disperse congestion.',
    pdf_url: '#',
    api_links: [
      { name: 'Open Government Data (OGD)', url: 'https://data.gov.in' }
    ]
  }
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Hard: 'bg-danger/10 text-danger border-danger/20',
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const supabase = createClient();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch('/api/hackathon/problems');
        if (res.ok) {
          const json = await res.json();
          // Map properties if database results don't have category or difficulty
          const mappedProblems = (json.problems || []).map((p: any, idx: number) => ({
            ...p,
            difficulty: p.difficulty || (idx % 3 === 0 ? 'Hard' : 'Medium'),
            category: p.category || (idx % 3 === 0 ? 'Civic Tech' : idx % 3 === 1 ? 'Blockchain' : 'IoT & Sensors')
          }));
          setProblems(mappedProblems);
        } else {
          setProblems(MOCK_PROBLEMS);
        }
      } catch {
        setProblems(MOCK_PROBLEMS);
      }
      setLoading(false);
    };

    fetchProblems();
  }, [supabase]);

  // Extract unique tracks
  const tracks = ['All', ...Array.from(new Set(problems.map((p) => p.track)))];

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.track.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'All' || problem.track === selectedTrack;
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="flex-grow bg-bg-primary section-py">
      <div className="w-full max-w-[1400px] mx-auto px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Problem Statements</span>
          </div>
          <h2 className="section-heading text-white">
            National Challenges
          </h2>
          <p className="body-text text-sm sm:text-base">
            Select from the curated national challenges. Design innovative software or hardware solutions targeting citizen-centric governance, digital inclusion, and smart city infrastructures.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-6 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search challenges or tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-bg-primary border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition-all duration-300 border ${
                  selectedTrack === track
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/25'
                    : 'bg-bg-primary border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading problem statements...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-550 bg-surface/20 border border-dashed border-white/5 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-slate-650 mb-3" />
            <p className="font-bold text-sm text-slate-400">No problem statements match your search criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or changing terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProblems.map((problem) => {
              const diffStyle = DIFFICULTY_COLORS[problem.difficulty] || DIFFICULTY_COLORS.Medium;
              return (
                <div
                  key={problem.id}
                  className="glass-card p-8 sm:p-10 flex flex-col justify-between h-full group"
                >
                  <div className="space-y-5">
                    {/* Tags Bar */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary py-1 px-3 rounded-lg border border-primary/15">
                        {problem.track}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${diffStyle}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-white/5 bg-bg-primary text-slate-450">
                          {problem.category}
                        </span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl font-extrabold text-white leading-snug group-hover:text-primary transition-colors duration-300">
                      {problem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-5">
                      {problem.description}
                    </p>
                  </div>

                  {/* Resource footer */}
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    {/* APIs */}
                    {problem.api_links && problem.api_links.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Resource APIs & Datasets</span>
                        <div className="flex flex-wrap gap-2">
                          {problem.api_links.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] text-slate-350 hover:text-primary bg-bg-primary px-3 py-1 rounded-lg border border-white/5 hover:border-primary/20 transition-all"
                            >
                              <Code className="w-3 h-3 text-primary" />
                              <span className="font-semibold">{link.name}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brief Download */}
                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={problem.pdf_url}
                        className="text-xs font-bold text-slate-300 hover:text-white inline-flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4.5 h-4.5 text-primary" />
                        <span>Download Statement PDF</span>
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
