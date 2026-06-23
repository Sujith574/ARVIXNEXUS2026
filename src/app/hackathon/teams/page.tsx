'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, ShieldAlert, Loader2, Copy, Check, LogOut, Trash2, UserMinus } from 'lucide-react';

export default function TeamsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfileAndTeam();
  }, [supabase, router]);

  const fetchProfileAndTeam = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Fetch profile from MongoDB API
      const profRes = await fetch('/api/profile');
      if (!profRes.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profJson = await profRes.json();
      const profData = profJson.profile;
      if (profData) {
        profData.id = profData._id;
      }
      setProfile(profData);

      // 2. Fetch team details from MongoDB API
      const teamRes = await fetch('/api/hackathon/teams');
      if (!teamRes.ok) {
        throw new Error('Failed to fetch team');
      }
      const teamJson = await teamRes.json();
      const teamData = teamJson.team;
      const membersData = teamJson.members || [];

      if (teamData) {
        teamData.id = teamData._id;
        const normalizedMembers = membersData.map((m: any) => {
          if (m.profiles) {
            m.profiles.id = m.profiles._id;
          }
          return m;
        });
        setTeam(teamData);
        setMembers(normalizedMembers);
      } else {
        setTeam(null);
        setMembers([]);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setFormLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/hackathon/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create team.');
      }
      setMsg({ type: 'success', text: 'Team created successfully!' });
      setNewTeamName('');
      await fetchProfileAndTeam();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setFormLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/hackathon/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join team.');
      }
      setMsg({ type: 'success', text: 'Successfully joined team!' });
      setInviteCode('');
      await fetchProfileAndTeam();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    setFormLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/hackathon/teams?action=leave', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to leave team.');
      }
      setMsg({ type: 'success', text: 'You have left the team.' });
      await fetchProfileAndTeam();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team || team.captain_id !== profile.id) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/hackathon/teams?action=remove&memberId=${memberId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove member.');
      }
      setMsg({ type: 'success', text: 'Member removed from team.' });
      await fetchProfileAndTeam();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteTeam = async () => {
    if (!team || team.captain_id !== profile.id) return;
    setFormLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/hackathon/teams?action=delete', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete team.');
      }
      setMsg({ type: 'success', text: 'Team deleted successfully.' });
      await fetchProfileAndTeam();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (team) {
      navigator.clipboard.writeText(team.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Team Workspace
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Form a team with up to 4 participants to work on challenges together, share real-time chat with assigned mentors, and submit projects.
          </p>
        </div>

        {msg && (
          <div className={`p-4 rounded-lg text-sm text-center border ${
            msg.type === 'success' 
              ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-355' 
              : 'bg-rose-950/30 border-rose-900/50 text-rose-350'
          }`}>
            {msg.text}
          </div>
        )}

        {team ? (
          /* View Team Details */
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-850 gap-4">
                <div>
                  <span className="text-[10px] bg-blue-950/45 text-blue-400 border border-blue-900/30 py-1 px-2.5 rounded font-bold uppercase tracking-wider">
                    Official Hackathon Team
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">{team.name}</h3>
                </div>

                <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs">
                    <span className="text-slate-500 block font-semibold">INVITE CODE</span>
                    <span className="text-lg font-mono font-bold tracking-widest text-white">{team.code}</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-350 hover:text-white rounded-lg transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" /> Team Members ({members.length}/4)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((m: any) => {
                    const isCap = m.profiles.id === team.captain_id;
                    const isMe = m.profiles.id === profile.id;
                    return (
                      <div
                        key={m.profiles.id}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex justify-between items-start hover:border-slate-750 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{m.profiles.full_name}</span>
                            {isCap && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.5 rounded">
                                Captain
                              </span>
                            )}
                            {isMe && (
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-950/40 border border-blue-900/40 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 space-y-1">
                            <div>Email: {m.profiles.email}</div>
                            {m.profiles.phone && <div>Phone: {m.profiles.phone}</div>}
                            {m.profiles.github && (
                              <div>
                                GitHub:{' '}
                                <a href={m.profiles.github} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                                  {m.profiles.github.replace('https://github.com/', '')}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Captain actions to remove member */}
                        {team.captain_id === profile.id && !isCap && (
                          <button
                            onClick={() => handleRemoveMember(m.profiles.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors"
                            title="Remove Member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-6 border-t border-slate-850 flex justify-between items-center gap-4 flex-wrap">
                {team.captain_id === profile.id ? (
                  <>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Captains can remove members or delete the team entirely.</span>
                    </div>
                    <button
                      onClick={handleDeleteTeam}
                      disabled={formLoading}
                      className="flex items-center gap-1.5 py-2 px-4 bg-rose-950/30 hover:bg-rose-600 border border-rose-900 text-rose-350 hover:text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Team</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div></div>
                    <button
                      onClick={handleLeaveTeam}
                      disabled={formLoading}
                      className="flex items-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-rose-600 border border-slate-800 text-slate-350 hover:text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Leave Team</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* Join or Create Team Options */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Create Team Card */}
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Create a Team</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Start a new team as a Captain. Once created, you will get an invite code to share with other participants so they can join you.
                </p>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4 pt-4 border-t border-slate-850">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formLoading || !newTeamName.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Establish Team</span>}
                </button>
              </form>
            </div>

            {/* Join Team Card */}
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Join a Team</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Have an invitation code from another participant? Input their code below to automatically join their team roster.
                </p>
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-4 pt-4 border-t border-slate-850">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    6-Character Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. AX91Z2"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="block w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase tracking-widest font-mono font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formLoading || inviteCode.trim().length !== 6}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Join Team Workspace</span>}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
