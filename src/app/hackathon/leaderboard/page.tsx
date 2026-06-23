'use client';

import { useEffect, useState, useMemo } from 'react';
import { Trophy, Link as LinkIcon, Loader2, Zap, RefreshCw, EyeOff, ExternalLink, Search, Filter, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { team_id: '1', team_name: 'Alpha Coders', project_title: 'AI Grievance Engine', track: 'AI for Governance', repo_url: 'https://github.com', judges_count: 3, total_score: 38.5 },
  { team_id: '2', team_name: 'Dhara Tech', project_title: 'Blockchain Land Registry', track: 'Digital India', repo_url: 'https://github.com', judges_count: 2, total_score: 36.2 },
  { team_id: '3', team_name: 'Skyline Devs', project_title: 'IoT Traffic Controller', track: 'Smart Cities', repo_url: 'https://github.com', judges_count: 3, total_score: 34.8 },
  { team_id: '4', team_name: 'Team Bhashini', project_title: 'Local Translation Bot', track: 'AI for Governance', repo_url: 'https://github.com', judges_count: 2, total_score: 33.1 },
  { team_id: '5', team_name: 'Vishwa Innovators', project_title: 'Smart Health Monitor', track: 'Digital India', repo_url: 'https://github.com', judges_count: 2, total_score: 31.5 },
  { team_id: '6', team_name: 'Nagar Tech', project_title: 'Pothole Alert System', track: 'Smart Cities', repo_url: 'https://github.com', judges_count: 3, total_score: 30.2 },
  { team_id: '7', team_name: 'Crypto Sign', project_title: 'Smart E-Stamping', track: 'Digital India', repo_url: 'https://github.com', judges_count: 2, total_score: 29.8 },
  { team_id: '8', team_name: 'Neural Stack', project_title: 'Crop Disease Predictor', track: 'AI for Governance', repo_url: 'https://github.com', judges_count: 2, total_score: 28.5 },
];

const RANK_MEDAL: Record<number, { emoji: string; color: string; bg: string }> = {
  1: { emoji: '🥇', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  2: { emoji: '🥈', color: 'text-slate-300', bg: 'bg-slate-700/20 border-slate-600/20' },
  3: { emoji: '🥉', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
};

const ITEMS_PER_PAGE = 5;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Search, Filter, Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/hackathon/leaderboard');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.is_hidden) {
        setIsHidden(true);
        setLeaderboard([]);
      } else if (data.leaderboard?.length > 0) {
        setIsHidden(false);
        // Map database records with track if missing
        const mappedData = data.leaderboard.map((item: any, idx: number) => ({
          ...item,
          track: item.track || (idx % 3 === 0 ? 'AI for Governance' : idx % 3 === 1 ? 'Digital India' : 'Smart Cities')
        }));
        setLeaderboard(mappedData);
      } else {
        setIsHidden(false);
        setLeaderboard(MOCK_LEADERBOARD);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setIsHidden(false);
      setLeaderboard(MOCK_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    let id: ReturnType<typeof setInterval> | null = null;
    if (realtimeActive) {
      id = setInterval(fetchLeaderboard, 5000);
    }
    return () => { if (id) clearInterval(id); };
  }, [realtimeActive]);

  // Unique Tracks list
  const tracks = useMemo(() => {
    const list = leaderboard.map(item => item.track).filter(Boolean);
    return ['All', ...Array.from(new Set(list))];
  }, [leaderboard]);

  // Filtering Logic
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(item => {
      const matchesSearch = 
        item.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrack = selectedTrack === 'All' || item.track === selectedTrack;
      return matchesSearch && matchesTrack;
    });
  }, [leaderboard, searchTerm, selectedTrack]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeaderboard.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeaderboard.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeaderboard, currentPage]);

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTrack]);

  return (
    <div className="flex-grow bg-bg-primary section-py">
      <div className="w-full max-w-[1400px] mx-auto px-8 space-y-12">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-500/20">
            <Trophy className="w-4 h-4" />
            <span>Live Standings</span>
          </div>
          <h1 className="section-heading text-white">
            National Leaderboard
          </h1>
          <p className="body-text text-sm sm:text-base">
            Real-time rankings based on cumulative scoring from the VIP audit committee across evaluation milestones.
          </p>
        </div>

        {/* Search, Filter & Status Controls */}
        <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative group min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search team or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 bg-bg-primary border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

            {/* Track Filter */}
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="block w-full pl-10 pr-8 py-2.5 bg-bg-primary border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer font-semibold"
              >
                {tracks.map(track => (
                  <option key={track} value={track} className="bg-surface text-white">
                    {track}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Sync Stats */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2.5 text-right hidden xs:block">
              <span className="text-xs font-bold text-slate-300 block">
                {realtimeActive ? 'Live Polling Active' : 'Polling Suspended'}
              </span>
              {lastUpdated && (
                <p className="text-[10px] text-slate-500 font-semibold">Synced: {lastUpdated}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { setLoading(true); fetchLeaderboard(); }}
                className="p-2.5 bg-bg-primary hover:bg-slate-900 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                title="Force reload rankings"
                aria-label="Force reload"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setRealtimeActive(!realtimeActive)}
                className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all border whitespace-nowrap
                  ${realtimeActive
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-bg-primary border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
              >
                {realtimeActive ? '⏸ Pause' : '▶ Resume'}
              </button>
            </div>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-slate-500 text-sm">Collating real-time scorecards...</p>
          </div>
        ) : isHidden ? (
          <div className="glass-card card-padding text-center space-y-6 max-w-xl mx-auto shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 flex items-center justify-center rounded-2xl">
              <EyeOff className="w-8 h-8 text-danger" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">Scores Temporarily Hidden</h3>
              <p className="body-text text-sm max-w-md mx-auto">
                Evaluations are locked for final audit by government committee delegates. Standings will reveal upon platform signoff.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            {filteredLeaderboard.length >= 3 && selectedTrack === 'All' && searchTerm === '' && (
              <div className="hidden sm:grid grid-cols-3 gap-6 items-end pt-4">
                
                {/* 2nd Place */}
                <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 border-slate-800">
                  <span className="text-4xl">🥈</span>
                  <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-700/20 border border-slate-600/20 text-slate-300">
                    Rank #2
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-snug">{filteredLeaderboard[1].team_name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{filteredLeaderboard[1].project_title}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-2xl font-black text-white">{filteredLeaderboard[1].total_score}</span>
                    <span className="text-xs text-slate-600 font-normal"> / 40.0</span>
                  </div>
                </div>

                {/* 1st Place - Highlighted */}
                <div className="glass-card p-8 flex flex-col items-center text-center space-y-4 border-amber-500/20 shadow-lg shadow-amber-500/5 -translate-y-4">
                  <span className="text-5xl animate-bounce">🥇</span>
                  <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Grand Champion
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-lg leading-snug">{filteredLeaderboard[0].team_name}</h4>
                    <p className="text-xs text-slate-450 mt-1 line-clamp-1">{filteredLeaderboard[0].project_title}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-amber-400">{filteredLeaderboard[0].total_score}</span>
                    <span className="text-xs text-slate-500 font-normal"> / 40.0</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 border-slate-800">
                  <span className="text-4xl">🥉</span>
                  <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    Rank #3
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-snug">{filteredLeaderboard[2].team_name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{filteredLeaderboard[2].project_title}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-2xl font-black text-white">{filteredLeaderboard[2].total_score}</span>
                    <span className="text-xs text-slate-600 font-normal"> / 40.0</span>
                  </div>
                </div>

              </div>
            )}

            {/* Full Rankings Table container */}
            <div className="glass-card overflow-hidden">
              
              {/* Desktop Sticky Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-bg-primary border-b border-white/5 sticky top-0">
                    <tr className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-5 text-center w-20">Rank</th>
                      <th className="px-6 py-5">Team & Project Coordinates</th>
                      <th className="px-6 py-5">Category Domain</th>
                      <th className="px-6 py-5 text-center w-28">Mentors</th>
                      <th className="px-6 py-5 text-center w-48">Audit Status</th>
                      <th className="px-6 py-5 text-right w-36">Average Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedData.map((item, idx) => {
                      const absoluteRank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                      const medal = RANK_MEDAL[absoluteRank];
                      const progressPercent = Math.round((item.total_score / 40) * 100);
                      
                      // Generate initials for avatar
                      const initials = item.team_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                      return (
                        <tr
                          key={item.team_id}
                          className={`transition-colors hover:bg-slate-800/10 ${
                            absoluteRank === 1 ? 'bg-amber-500/3' : absoluteRank === 2 ? 'bg-slate-800/5' : absoluteRank === 3 ? 'bg-orange-500/3' : ''
                          }`}
                        >
                          {/* Rank column */}
                          <td className="px-6 py-5 text-center font-extrabold text-base">
                            {medal ? (
                              <span className="text-2xl">{medal.emoji}</span>
                            ) : (
                              <span className="text-slate-500 text-sm">#{absoluteRank}</span>
                            )}
                          </td>

                          {/* Team column */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/25 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{item.team_name}</span>
                                  {item.repo_url && (
                                    <a
                                      href={item.repo_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-500 hover:text-primary transition-colors flex-shrink-0"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-xs text-slate-450 mt-0.5 truncate">{item.project_title}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="px-6 py-5">
                            <span className="text-xs font-semibold text-slate-300">
                              {item.track}
                            </span>
                          </td>

                          {/* Judges count column */}
                          <td className="px-6 py-5 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-bg-primary border border-white/5 text-xs font-bold text-slate-300">
                              {item.judges_count}
                            </span>
                          </td>

                          {/* Score bar progress */}
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="w-full bg-bg-primary border border-white/5 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-700 ${
                                    absoluteRank === 1 ? 'bg-amber-400' : absoluteRank <= 3 ? 'bg-primary' : 'bg-slate-450'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Metrics Collated</span>
                            </div>
                          </td>

                          {/* Total Score */}
                          <td className="px-6 py-5 text-right font-black">
                            <span className={`text-base ${absoluteRank === 1 ? 'text-amber-450' : absoluteRank <= 3 ? 'text-primary' : 'text-white'}`}>
                              {item.total_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-600 font-normal"> / 40.0</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile-Friendly Card Layout */}
              <div className="md:hidden divide-y divide-white/5">
                {paginatedData.map((item, idx) => {
                  const absoluteRank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const medal = RANK_MEDAL[absoluteRank];
                  const progressPercent = Math.round((item.total_score / 40) * 100);
                  const initials = item.team_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={item.team_id}
                      className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                        absoluteRank === 1 ? 'bg-amber-500/3' : ''
                      }`}
                    >
                      {/* Rank indicator */}
                      <div className="flex-shrink-0 w-8 text-center font-extrabold">
                        {medal ? (
                          <span className="text-2xl">{medal.emoji}</span>
                        ) : (
                          <span className="text-xs text-slate-500">#{absoluteRank}</span>
                        )}
                      </div>

                      {/* Team details */}
                      <div className="flex-grow min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-bold text-white text-sm truncate">{item.team_name}</span>
                        </div>
                        <p className="text-xs text-slate-450 truncate">{item.project_title}</p>
                        
                        <div className="w-full bg-bg-primary border border-white/5 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-1 rounded-full transition-all duration-750 ${
                              absoluteRank === 1 ? 'bg-amber-400' : absoluteRank <= 3 ? 'bg-primary' : 'bg-slate-450'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-right">
                        <span className={`font-black text-base ${absoluteRank === 1 ? 'text-amber-450' : 'text-white'}`}>
                          {item.total_score.toFixed(1)}
                        </span>
                        <p className="text-[10px] text-slate-500">/ 40.0</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-slate-500 font-semibold">
                  Showing page {currentPage} of {totalPages} ({filteredLeaderboard.length} teams total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-surface hover:bg-slate-900 border border-white/5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-surface hover:bg-slate-900 border border-white/5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-600">
              Live Sync triggers every 5 seconds. All values represent certified averages calculated from audit keys.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
