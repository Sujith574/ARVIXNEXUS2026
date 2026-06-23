'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileCode, Plus, CheckCircle, XCircle, Loader2, ListCollapse, Award, ShieldAlert } from 'lucide-react';

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
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
          action: 'createProblem',
          title: title.trim(),
          description: description.trim(),
          track,
          api_links: apiLinks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish problem statement.');

      setMsg({ type: 'success', text: 'Problem statement added successfully!' });
      setTitle('');
      setDescription('');
      setApiName1('');
      setApiUrl1('');
      await fetchData(); // Refresh list
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setFormLoading(false);
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
        <p className="text-slate-400 text-xs mt-1">Configure challenges and oversee project submission grading status.</p>
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

      {/* Two columns - problem statement builder and details list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create form */}
        <div className="lg:col-span-1 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" /> Create Problem Statement
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

            <button
              type="submit"
              disabled={formLoading || !title.trim() || !description.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-md disabled:opacity-50 mt-2"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Statement</span>}
            </button>

          </form>
        </div>

        {/* Problem list column */}
        <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ListCollapse className="w-4 h-4 text-blue-400" /> Challenge Inventory ({problems.length})
          </h3>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
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

                  <button
                    onClick={() => handleToggleActive(prob.id, prob.is_active)}
                    className="shrink-0 text-xs"
                    title={prob.is_active ? 'Disable statement' : 'Enable statement'}
                  >
                    {prob.is_active ? (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4.5 h-4.5 text-rose-500" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Submissions Grading Progress */}
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
