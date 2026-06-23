'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Download, ExternalLink, Code, Database, AlertCircle, Loader2 } from 'lucide-react';

const MOCK_PROBLEMS = [
  {
    id: 'mock-1',
    title: 'AI-Enabled Public Grievance Redressal System',
    track: 'AI for Governance',
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
    description: 'Integrate real-time feeds from city air quality sensors and traffic cameras. Build an intelligent traffic light control system that optimizes traffic flows dynamically in high pollution hotspots to disperse congestion.',
    pdf_url: '#',
    api_links: [
      { name: 'Open Government Data (OGD)', url: 'https://data.gov.in' }
    ]
  }
];

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
          setProblems(json.problems || []);
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
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'All' || problem.track === selectedTrack;
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="flex-grow bg-slate-950 py-12">
      <div className="container-page space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20">
            Hackathon Themes
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Problem Statements
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Select from the curated national challenges. Design innovative hardware or software solutions targeting citizen-centric governance, digital inclusion, and infrastructure.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all duration-200 border ${
                  selectedTrack === track
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl">
            <AlertCircle className="w-10 h-10 text-slate-650 mb-2" />
            <p className="font-semibold text-sm">No problem statements match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-blue-500/40 hover:bg-slate-900/40 transition-all duration-300 shadow-lg group h-full"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-950/45 text-blue-400 py-1 px-2.5 rounded-md border border-blue-900/30">
                      {problem.track}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition-colors duration-250">
                    {problem.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">
                    {problem.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-850 space-y-3">
                  {/* API / Resources */}
                  {problem.api_links && problem.api_links.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">APIs & Datasets</span>
                      <div className="flex flex-wrap gap-2">
                        {problem.api_links.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-350 hover:text-blue-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/80 transition-colors"
                          >
                            <Code className="w-3 h-3" />
                            <span>{link.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={problem.pdf_url}
                      className="text-xs font-semibold text-slate-350 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4 text-blue-500" />
                      <span>Download Brief</span>
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
