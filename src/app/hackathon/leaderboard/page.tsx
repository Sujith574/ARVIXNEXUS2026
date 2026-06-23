'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Link as LinkIcon, Loader2, Zap, RefreshCw } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { team_id: '1', team_name: 'Alpha Coders', project_title: 'AI Grievance Engine', repo_url: 'https://github.com', judges_count: 3, total_score: 38.5 },
  { team_id: '2', team_name: 'Dhara Tech', project_title: 'Blockchain Land Registry', repo_url: 'https://github.com', judges_count: 2, total_score: 36.2 },
  { team_id: '3', team_name: 'Skyline Devs', project_title: 'IoT Traffic Controller', repo_url: 'https://github.com', judges_count: 3, total_score: 34.8 },
  { team_id: '4', team_name: 'Team Bhashini', project_title: 'Local Translation Bot', repo_url: 'https://github.com', judges_count: 2, total_score: 33.1 },
  { team_id: '5', team_name: 'Vishwa Innovators', project_title: 'Smart Health Monitor', repo_url: 'https://github.com', judges_count: 2, total_score: 31.5 }
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(true);
  const supabase = createClient();

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/hackathon/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      if (data.leaderboard && data.leaderboard.length > 0) {
        setLeaderboard(data.leaderboard);
      } else {
        setLeaderboard(MOCK_LEADERBOARD);
      }
    } catch (err) {
      console.error('Leaderboard fetch error, falling back to mock data:', err);
      setLeaderboard(MOCK_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    let intervalId: any = null;
    if (realtimeActive) {
      intervalId = setInterval(() => {
        fetchLeaderboard();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [realtimeActive]);

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Real-time Standing
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Live ranks of submissions based on scores given by VIP judges. Scores are averages compiled across multiple categories.
          </p>
        </div>

        {/* Realtime Status Bar */}
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${realtimeActive ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-350">
              {realtimeActive ? 'Live Real-time Sync Active' : 'Real-time Sync Disabled'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchLeaderboard();
              }}
              className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
              title="Manual Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRealtimeActive(!realtimeActive)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all border ${
                realtimeActive
                  ? 'bg-amber-950/20 border-amber-900/50 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {realtimeActive ? 'Turn Off Live Sync' : 'Turn On Live Sync'}
            </button>
          </div>
        </div>

        {/* Table list */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-slate-950/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-center w-16">Rank</th>
                    <th scope="col" className="px-6 py-4">Team & Project</th>
                    <th scope="col" className="px-6 py-4 text-center">Judges</th>
                    <th scope="col" className="px-6 py-4 text-right">Average Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                  {leaderboard.map((item, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr
                        key={item.team_id}
                        className={`hover:bg-slate-900/30 transition-all ${
                          rank === 1
                            ? 'bg-amber-950/5'
                            : rank === 2
                            ? 'bg-slate-900/5'
                            : rank === 3
                            ? 'bg-orange-950/5'
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-center font-bold text-base">
                          {rank === 1 ? (
                            <span className="text-xl">🥇</span>
                          ) : rank === 2 ? (
                            <span className="text-xl">🥈</span>
                          ) : rank === 3 ? (
                            <span className="text-xl">🥉</span>
                          ) : (
                            <span className="text-slate-500">{rank}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {item.team_name}
                              {item.repo_url && (
                                <a
                                  href={item.repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-white transition-colors"
                                >
                                  <LinkIcon className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{item.project_title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-400">
                          {item.judges_count}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-white text-base">
                          <span className="text-blue-400">{item.total_score}</span>
                          <span className="text-xs text-slate-500 font-normal"> / 40</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
