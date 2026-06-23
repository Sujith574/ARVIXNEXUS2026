'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileCode, Plus, CheckCircle, XCircle, Loader2, ListCollapse, Award, ShieldAlert, Edit3, Trash2, Eye, EyeOff, Settings, Calendar, X } from 'lucide-react';

export default function HackathonManagementPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new problem
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [track, setTrack] = useState('AI for Governance');
  const [apiName1, setApiName1] = useState('');
  const [apiUrl1, setApiUrl1] = useState('');
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Settings & Timeline States
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);
  const [rounds, setRounds] = useState<any[]>([]);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundTitle, setRoundTitle] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundTimeline, setRoundTimeline] = useState('');
  const [roundDescription, setRoundDescription] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hackathon');
      if (!res.ok) throw new Error('Failed to fetch hackathon data');
      const data = await res.json();
      setProblems(data.problems || []);
      setSubmissions(data.submissions || []);
      setJudges(data.judges || []);

      // Fetch global settings
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setLeaderboardVisible(settingsData.leaderboard_visible);
        setRounds(settingsData.rounds || []);
        setRoundNumber((settingsData.rounds?.length || 0) + 1);
      }
    } catch (err) {
      console.error('Error fetching hackathon admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setFormLoading(true);
    setMsg(null);

    const apiLinks = [];
    if (apiName1.trim() && apiUrl1.trim()) {
      apiLinks.push({ name: apiName1.trim(), url: apiUrl1.trim() });
    }

    try {
      const res = await fetch('/api/admin/hackathon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingProblemId ? 'editProblem' : 'createProblem',
          id: editingProblemId || undefined,
          title: title.trim(),
          description: description.trim(),
          track,
          api_links: apiLinks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish problem statement.');

      setMsg({
        type: 'success',
        text: editingProblemId ? 'Problem statement updated successfully!' : 'Problem statement added successfully!'
      });
      setTitle('');
      setDescription('');
      setApiName1('');
      setApiUrl1('');
      setEditingProblemId(null);
      await fetchData(); // Refresh list
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const startEditProblem = (prob: any) => {
    setTitle(prob.title);
    setDescription(prob.description);
    setTrack(prob.track);
    if (prob.api_links && prob.api_links.length > 0) {
      setApiName1(prob.api_links[0].name || '');
      setApiUrl1(prob.api_links[0].url || '');
    } else {
      setApiName1('');
      setApiUrl1('');
    }
    setEditingProblemId(prob.id);
  };

  const cancelEdit = () => {
    setTitle('');
    setDescription('');
    setTrack('AI for Governance');
    setApiName1('');
    setApiUrl1('');
    setEditingProblemId(null);
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem statement? This action cannot be undone.')) return;
    setMsg(null);
    try {
      const res = await fetch('/api/admin/hackathon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteProblem',
          id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete problem statement.');

      setMsg({ type: 'success', text: 'Problem statement deleted successfully!' });
      if (editingProblemId === id) {
        cancelEdit();
      }
      await fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/hackathon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleActive',
          id,
          currentStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle active status.');
      await fetchData();
    } catch (err) {
      console.error('Error toggling problem status:', err);
    }
  };

  // Settings & Rounds Handlers
  const handleToggleLeaderboard = async (visible: boolean) => {
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleLeaderboard',
          visible,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update leaderboard visibility.');
      setLeaderboardVisible(data.leaderboard_visible);
      setMsg({
        type: 'success',
        text: `Leaderboard is now ${data.leaderboard_visible ? 'VISIBLE' : 'HIDDEN'} to all users.`
      });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleSaveRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundTitle.trim() || !roundDate.trim() || !roundTimeline.trim()) return;
    setFormLoading(true);
    setMsg(null);

    const isEdit = !!roundId;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEdit ? 'editRound' : 'addRound',
          id: roundId || undefined,
          round_number: roundNumber,
          title: roundTitle.trim(),
          date: roundDate.trim(),
          timeline: roundTimeline.trim(),
          description: roundDescription.trim() || 'Evaluation and feedback session.',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save round.');

      setMsg({
        type: 'success',
        text: `Evaluation Round ${roundNumber} ${isEdit ? 'updated' : 'added'} successfully!`
      });
      cancelEditRound();
      // Refetch configurations
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setLeaderboardVisible(settingsData.leaderboard_visible);
        setRounds(settingsData.rounds || []);
        setRoundNumber((settingsData.rounds?.length || 0) + 1);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const startEditRound = (r: any) => {
    setRoundId(r.id);
    setRoundNumber(r.round_number);
    setRoundTitle(r.title);
    setRoundDate(r.date);
    setRoundTimeline(r.timeline);
    setRoundDescription(r.description);
  };

  const cancelEditRound = () => {
    setRoundId(null);
    setRoundNumber(rounds.length + 1);
    setRoundTitle('');
    setRoundDate('');
    setRoundTimeline('');
    setRoundDescription('');
  };

  const handleDeleteRound = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation round?')) return;
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteRound',
          id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete round.');

      setMsg({ type: 'success', text: 'Evaluation round deleted successfully!' });
      cancelEditRound();
      // Refetch configurations
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setLeaderboardVisible(settingsData.leaderboard_visible);
        setRounds(settingsData.rounds || []);
        setRoundNumber((settingsData.rounds?.length || 0) + 1);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Hackathon Manager</h2>
        <p className="text-slate-400 text-xs mt-1">Configure challenges, manage evaluation rounds, toggle leaderboard access, and grade submissions.</p>
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

      {/* Grid Row 1: Problem Statements CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            {editingProblemId ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-blue-400" />}
            {editingProblemId ? 'Edit Problem Statement' : 'Create Problem Statement'}
          </h3>

          <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Challenge Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Public Service Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Track / Theme
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="AI for Governance">AI for Governance</option>
                <option value="Digital India">Digital India</option>
                <option value="Smart Cities">Smart Cities</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="HealthTech">HealthTech</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe the core problem statement, inputs, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-850 space-y-3">
              <span className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider">Reference API/Dataset</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="API Name"
                  value={apiName1}
                  onChange={(e) => setApiName1(e.target.value)}
                  className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="API URL"
                  value={apiUrl1}
                  onChange={(e) => setApiUrl1(e.target.value)}
                  className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {editingProblemId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-2 px-4 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-350 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading || !title.trim() || !description.trim()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-semibold text-xs transition-colors shadow-md disabled:opacity-50 ${
                  editingProblemId 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{editingProblemId ? 'Save Changes' : 'Publish Statement'}</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Problem List */}
        <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ListCollapse className="w-4 h-4 text-blue-400" /> Challenge Inventory ({problems.length})
          </h3>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {problems.length === 0 ? (
              <p className="text-xs text-slate-550 italic">No problem statements created yet.</p>
            ) : (
              problems.map((prob) => (
                <div key={prob.id} className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-blue-955 text-blue-450 border border-blue-900/30 font-bold px-2 py-0.5 rounded uppercase">
                        {prob.track}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-white mt-1 leading-snug">{prob.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{prob.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <button
                      onClick={() => startEditProblem(prob)}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                      title="Edit challenge"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProblem(prob.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Delete challenge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(prob.id, prob.is_active)}
                      className="p-1 text-slate-400 hover:text-white"
                      title={prob.is_active ? 'Disable statement' : 'Enable statement'}
                    >
                      {prob.is_active ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4.5 h-4.5 text-rose-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Grid Row 2: Leaderboard Visibility & Hackathon Rounds CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-slate-850 pt-8">
        
        {/* Leaderboard Toggle Card */}
        <div className="lg:col-span-1 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" /> Leaderboard Display Config
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use this toggle to hide or show the live ranking leaderboard for all students and public guests. When hidden, users see a placeholder screen.
            </p>
          </div>

          <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Leaderboard Status</span>
            <button
              onClick={() => handleToggleLeaderboard(!leaderboardVisible)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                leaderboardVisible 
                  ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-400' 
                  : 'bg-rose-950/30 border border-rose-900/50 text-rose-400'
              }`}
            >
              {leaderboardVisible ? (
                <>
                  <Eye className="w-4 h-4" /> Enabled (Visible)
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" /> Disabled (Hidden)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hackathon Rounds CRUD Forms */}
        <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" /> Hackathon Evaluation Rounds ({rounds.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rounds Form */}
            <form onSubmit={handleSaveRound} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Round No.
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(Number(e.target.value))}
                    className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Round Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. July 11, 2026"
                    value={roundDate}
                    onChange={(e) => setRoundDate(e.target.value)}
                    className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Round Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Round 1: Pitch & Stack Submission"
                  value={roundTitle}
                  onChange={(e) => setRoundTitle(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Timeline / Hours
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 AM - 05:00 PM IST"
                  value={roundTimeline}
                  onChange={(e) => setRoundTimeline(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description / Focus Area
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Focus of evaluation criteria..."
                  value={roundDescription}
                  onChange={(e) => setRoundDescription(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none resize-none text-xs"
                />
              </div>

              <div className="flex gap-2">
                {roundId && (
                  <button
                    type="button"
                    onClick={cancelEditRound}
                    className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formLoading || !roundTitle.trim() || !roundDate.trim()}
                  className="flex-grow flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {roundId ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" /> Save Round
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add Round
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Rounds List */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {rounds.length === 0 ? (
                <p className="text-[10px] text-slate-550 italic">No rounds defined. Homepage will render defaults.</p>
              ) : (
                rounds.map((r) => (
                  <div key={r.id} className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg text-[10px] text-slate-455 flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-2">
                      <span className="font-bold text-white block">Round {r.round_number}: {r.title}</span>
                      <span className="text-slate-550 block mt-0.5">{r.date} | {r.timeline}</span>
                      <span className="text-slate-605 block mt-0.5 truncate">{r.description}</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => startEditRound(r)}
                        className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors"
                        title="Edit round"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRound(r.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                        title="Delete round"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Grid Row 3: Submissions Grading Progress */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Project Submissions & Grading Status ({submissions.length})
          </h3>
          <p className="text-slate-505 text-xs mt-0.5">Track team submissions, code URLs, and grading statuses.</p>
        </div>

        <div className="bg-slate-955 rounded-xl border border-slate-850 divide-y divide-slate-850 overflow-hidden text-xs">
          {submissions.length === 0 ? (
            <p className="p-8 text-center text-slate-550 italic">No submissions registered in the system yet.</p>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/20 transition-all">
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{sub.teams?.name}</span>
                    <span className={`text-[9px] font-semibold py-0.2 px-1.5 rounded uppercase border ${
                      sub.status === 'submitted' 
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-505'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-350">{sub.title}</h4>
                  <a href={sub.repo_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-450 hover:underline block truncate max-w-md">
                    {sub.repo_url}
                  </a>
                </div>

                <div className="text-right flex items-center gap-4 shrink-0">
                  <div className="text-slate-500 font-semibold text-[10px]">
                    {sub.status === 'submitted' ? (
                      <span className="text-amber-500">Grading Open</span>
                    ) : (
                      <span>Draft Workspace</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
