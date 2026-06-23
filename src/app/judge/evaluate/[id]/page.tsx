'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Award, Code, Video, FileText, ArrowLeft, Save, ShieldAlert, Loader2, Check, Globe } from 'lucide-react';
import Link from 'next/link';

export default function EvaluatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: submissionId } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Score states
  const [innovation, setInnovation] = useState<number>(0);
  const [impact, setImpact] = useState<number>(0);
  const [technical, setTechnical] = useState<number>(0);
  const [presentation, setPresentation] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [supabase, router, submissionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Get judge profile
      const profRes = await fetch('/api/profile');
      if (!profRes.ok) throw new Error('Failed to fetch profile');
      const profJson = await profRes.json();
      const prof = profJson.profile;

      if (!prof || (prof.role !== 'judge' && prof.role !== 'admin' && prof.role !== 'super_admin')) {
        router.push('/');
        return;
      }
      setProfile(prof);

      // 2. Get submission details and score from Judge API
      const judgeRes = await fetch(`/api/judge?submissionId=${submissionId}`);
      if (!judgeRes.ok) {
        router.push('/judge');
        return;
      }
      const judgeJson = await judgeRes.json();
      const subData = judgeJson.submission;
      const scoreData = judgeJson.score;

      if (!subData) {
        router.push('/judge');
        return;
      }
      setSubmission(subData);

      if (scoreData) {
        setInnovation(Number(scoreData.criteria_scores.innovation) || 0);
        setImpact(Number(scoreData.criteria_scores.impact) || 0);
        setTechnical(Number(scoreData.criteria_scores.technical) || 0);
        setPresentation(Number(scoreData.criteria_scores.presentation) || 0);
        setComment(scoreData.comment || '');
        setIsFinal(scoreData.is_final || false);
      }
    } catch (err) {
      console.error('Error fetching evaluation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScore = async (finalise: boolean) => {
    if (!profile || !submission) return;
    setSaving(true);
    setMsg(null);

    const scoresObj = {
      innovation,
      impact,
      technical,
      presentation,
    };

    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submission.id,
          criteria_scores: scoresObj,
          comment: comment,
          is_final: finalise,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save scorecard.');
      }

      setMsg({
        type: 'success',
        text: finalise ? 'Scores finalized and locked successfully!' : 'Draft score saved.',
      });
      fetchData(); // Reload status
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const totalScore = innovation + impact + technical + presentation;

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link href="/judge" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evaluation Console</span>
        </Link>

        {msg && (
          <div className={`p-4 rounded-lg text-sm text-center border ${
            msg.type === 'success' 
              ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-355' 
              : 'bg-rose-950/30 border-rose-900/50 text-rose-350'
          }`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submission Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
              <div>
                <span className="text-[10px] bg-blue-950/45 text-blue-400 border border-blue-900/30 py-1 px-2.5 rounded font-bold uppercase tracking-wider">
                  Team: {submission.teams?.name}
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">{submission.title}</h3>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Description</h4>
                <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-line">
                  {submission.description}
                </p>
              </div>

              {/* Links */}
              <div className="pt-6 border-t border-slate-850 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href={submission.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white transition-all group"
                >
                  <Code className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="font-semibold block">GitHub Repository</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">View Source Code</span>
                  </div>
                </a>

                {submission.live_url && (
                  <a
                    href={submission.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white transition-all group"
                  >
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-semibold block">Live Website URL</span>
                      <span className="text-xs text-slate-505 group-hover:text-slate-400 transition-colors">Open Deployed App</span>
                    </div>
                  </a>
                )}

                {submission.demo_video_url && (
                  <a
                    href={submission.demo_video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white transition-all group"
                  >
                    <Video className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">Demo Video URL</span>
                      <span className="text-xs text-slate-505 group-hover:text-slate-400 transition-colors">Watch Walkthrough</span>
                    </div>
                  </a>
                )}
              </div>

            </div>
          </div>

          {/* Grading Form Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
              
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Evaluation Sheet
                </h3>
                {isFinal && (
                  <div className="mt-2 text-xs bg-emerald-950/20 border border-emerald-900 text-emerald-400 py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-semibold">
                    <Check className="w-4 h-4" /> Scores locked & submitted.
                  </div>
                )}
              </div>

              <div className="space-y-5">
                
                {/* Innovation */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400 uppercase tracking-wider">Innovation (0-10)</span>
                    <span className="text-white font-bold">{innovation}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    disabled={isFinal}
                    value={innovation}
                    onChange={(e) => setInnovation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Impact */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400 uppercase tracking-wider">Impact & Viability (0-10)</span>
                    <span className="text-white font-bold">{impact}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    disabled={isFinal}
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Technical Complexity */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400 uppercase tracking-wider">Technical Complexity (0-10)</span>
                    <span className="text-white font-bold">{technical}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    disabled={isFinal}
                    value={technical}
                    onChange={(e) => setTechnical(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Presentation */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400 uppercase tracking-wider">Presentation & UX (0-10)</span>
                    <span className="text-white font-bold">{presentation}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    disabled={isFinal}
                    value={presentation}
                    onChange={(e) => setPresentation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Total Score display */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aggregate Score</span>
                  <span className="text-2xl font-extrabold text-blue-400">
                    {totalScore} <span className="text-xs text-slate-655 font-normal"> / 40</span>
                  </span>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Judge Comments
                  </label>
                  <textarea
                    rows={4}
                    disabled={isFinal}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide constructive feedback for the team..."
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  />
                </div>

              </div>

              {!isFinal && (
                <div className="pt-6 border-t border-slate-850 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveScore(false)}
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft Score</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveScore(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-amber-500/10"
                  >
                    <Check className="w-4 h-4" />
                    <span>Finalize & Submit Score</span>
                  </button>
                  
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1 justify-center">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>Submitted scores cannot be changed.</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
