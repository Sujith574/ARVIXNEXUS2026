'use client';

import { useEffect, useState } from 'react';
import { Trophy, Link as LinkIcon, Loader2, Zap, RefreshCw, EyeOff, ExternalLink } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { team_id: '1', team_name: 'Alpha Coders', project_title: 'AI Grievance Engine', repo_url: 'https://github.com', judges_count: 3, total_score: 38.5 },
  { team_id: '2', team_name: 'Dhara Tech', project_title: 'Blockchain Land Registry', repo_url: 'https://github.com', judges_count: 2, total_score: 36.2 },
  { team_id: '3', team_name: 'Skyline Devs', project_title: 'IoT Traffic Controller', repo_url: 'https://github.com', judges_count: 3, total_score: 34.8 },
  { team_id: '4', team_name: 'Team Bhashini', project_title: 'Local Translation Bot', repo_url: 'https://github.com', judges_count: 2, total_score: 33.1 },
  { team_id: '5', team_name: 'Vishwa Innovators', project_title: 'Smart Health Monitor', repo_url: 'https://github.com', judges_count: 2, total_score: 31.5 },
];

const RANK_MEDAL: Record<number, { emoji: string; color: string; bg: string }> = {
  1: { emoji: '🥇', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  2: { emoji: '🥈', color: 'text-slate-300', bg: 'bg-slate-700/20 border-slate-600/20' },
  3: { emoji: '🥉', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

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
        setLeaderboard(data.leaderboard);
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

  const maxScore = leaderboard.length > 0 ? leaderboard[0]?.total_score || 40 : 40;

  return (
    <div className="flex-grow bg-slate-950">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-10 sm:py-14 lg:py-16 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            Live Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Competition <span className="text-amber-400">Leaderboard</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Real-time standings based on averaged scores from VIP judges across all evaluation rounds.
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <Zap className={`w-4 h-4 flex-shrink-0 ${realtimeActive ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} />
            <div>
              <span className="text-xs font-semibold text-slate-300">
                {realtimeActive ? 'Live Sync Active' : 'Live Sync Paused'}
              </span>
              {lastUpdated && (
                <p className="text-[10px] text-slate-600">Last updated: {lastUpdated}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLoading(true); fetchLeaderboard(); }}
              className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
              title="Refresh now"
              aria-label="Refresh leaderboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRealtimeActive(!realtimeActive)}
              className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all border whitespace-nowrap
                ${realtimeActive
                  ? 'bg-amber-950/20 border-amber-800/50 text-amber-400 hover:bg-amber-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
            >
              {realtimeActive ? '⏸ Pause Sync' : '▶ Resume Sync'}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-slate-500 text-sm">Loading rankings…</p>
          </div>
        ) : isHidden ? (
          <div className="bg-slate-900/40 p-10 sm:p-16 rounded-2xl border border-slate-800 text-center space-y-5">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 flex items-center justify-center rounded-full">
              <EyeOff className="w-8 h-8 text-rose-400 animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Leaderboard Temporarily Hidden</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Scores are being audited by the judging panel. The leaderboard will be revealed once administrators enable public access.
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards — visible on sm+ */}
            {leaderboard.length >= 3 && (
              <div className="hidden sm:grid grid-cols-3 gap-4">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((item, i) => {
                  const realIdx = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const medal = RANK_MEDAL[realIdx] || { emoji: `#${realIdx}`, color: 'text-slate-300', bg: 'bg-slate-800/20 border-slate-700/20' };
                  const isFeatured = realIdx === 1;
                  return (
                    <div
                      key={item.team_id}
                      className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all
                        ${isFeatured
                          ? 'bg-amber-950/10 border-amber-800/30 shadow-lg shadow-amber-500/5 -translate-y-2'
                          : 'bg-slate-900/30 border-slate-800'
                        }`}
                    >
                      <span className="text-3xl mb-2">{medal.emoji}</span>
                      <div className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${medal.bg} ${medal.color}`}>
                        #{realIdx} Place
                      </div>
                      <h4 className="font-bold text-white text-sm sm:text-base leading-snug">{item.team_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.project_title}</p>
                      <div className="mt-4 text-2xl font-black text-white">
                        <span className={medal.color}>{item.total_score}</span>
                        <span className="text-sm text-slate-600 font-normal"> / 40</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 border-b border-slate-800">
                    <tr className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      <th className="px-5 py-4 text-center w-16">Rank</th>
                      <th className="px-5 py-4 text-left">Team & Project</th>
                      <th className="px-5 py-4 text-center">Judges</th>
                      <th className="px-5 py-4 text-center">Score Bar</th>
                      <th className="px-5 py-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leaderboard.map((item, idx) => {
                      const rank = idx + 1;
                      const medal = RANK_MEDAL[rank];
                      const pct = Math.round((item.total_score / 40) * 100);
                      return (
                        <tr
                          key={item.team_id}
                          className={`transition-colors hover:bg-slate-800/20 ${
                            rank === 1 ? 'bg-amber-950/5' : rank === 2 ? 'bg-slate-800/5' : rank === 3 ? 'bg-orange-950/5' : ''
                          }`}
                        >
                          <td className="px-5 py-4 text-center font-bold text-lg">
                            {medal ? (
                              <span>{medal.emoji}</span>
                            ) : (
                              <span className="text-slate-500 text-sm">{rank}</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{item.team_name}</span>
                              {item.repo_url && (
                                <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors flex-shrink-0">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{item.project_title}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                              {item.judges_count}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-700 ${rank === 1 ? 'bg-amber-400' : rank <= 3 ? 'bg-blue-400' : 'bg-slate-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`font-black text-lg ${rank === 1 ? 'text-amber-400' : rank <= 3 ? 'text-blue-400' : 'text-white'}`}>
                              {item.total_score}
                            </span>
                            <span className="text-xs text-slate-600"> / 40</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-slate-800/60">
                {leaderboard.map((item, idx) => {
                  const rank = idx + 1;
                  const medal = RANK_MEDAL[rank];
                  const pct = Math.round((item.total_score / 40) * 100);
                  return (
                    <div
                      key={item.team_id}
                      className={`flex items-center gap-3 p-4 transition-colors ${
                        rank === 1 ? 'bg-amber-950/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-10 text-center">
                        {medal ? (
                          <span className="text-2xl">{medal.emoji}</span>
                        ) : (
                          <span className="text-sm font-black text-slate-500">#{rank}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white truncate">{item.team_name}</span>
                          {item.repo_url && (
                            <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors flex-shrink-0">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{item.project_title}</p>
                        <div className="w-full bg-slate-800 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full transition-all duration-700 ${rank === 1 ? 'bg-amber-400' : rank <= 3 ? 'bg-blue-400' : 'bg-slate-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-right">
                        <span className={`font-black text-lg ${rank === 1 ? 'text-amber-400' : 'text-white'}`}>
                          {item.total_score}
                        </span>
                        <p className="text-[10px] text-slate-600">/ 40</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-xs text-slate-600">
              Scores update every 5 seconds when Live Sync is active. Total score is averaged across all judge evaluations.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
