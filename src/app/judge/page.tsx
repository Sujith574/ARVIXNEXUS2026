'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Award, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function JudgeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [supabase, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Get judge profile from MongoDB API
      const profRes = await fetch('/api/profile');
      if (!profRes.ok) throw new Error('Failed to fetch profile');
      const profJson = await profRes.json();
      const prof = profJson.profile;

      if (!prof || (prof.role !== 'judge' && prof.role !== 'admin' && prof.role !== 'super_admin')) {
        router.push('/');
        return;
      }
      setProfile(prof);

      // 2. Get submissions and existing scores from judge API
      const judgeRes = await fetch('/api/judge');
      if (!judgeRes.ok) throw new Error('Failed to fetch judge dashboard data');
      const judgeJson = await judgeRes.json();
      
      setSubmissions(judgeJson.submissions || []);

      const scoresMap: Record<string, any> = {};
      judgeJson.scores?.forEach((sc: any) => {
        scoresMap[sc.submission_id] = sc;
      });
      setScores(scoresMap);
    } catch (err) {
      console.error('Error fetching judge dashboard:', err);
    } finally {
      setLoading(false);
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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/40 py-1 px-2.5 rounded font-bold uppercase tracking-wider">
              Judging Panel
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-2">Evaluation Console</h2>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, Judge <span className="font-semibold text-white">{profile?.full_name}</span>. Evaluate submissions on Innovation, Impact, Technical complexity, and Presentation.
            </p>
          </div>
          <Award className="w-12 h-12 text-amber-500 hidden sm:block" />
        </div>

        {/* Submissions list */}
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-655" />
            <div className="text-center">
              <p className="font-semibold text-sm">No submissions finalized yet.</p>
              <p className="text-xs text-slate-500 mt-1">Participants must perform a Final Submit to make projects available for evaluation.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((sub) => {
              const scoreRecord = scores[sub.id];
              const isGraded = scoreRecord?.is_final;
              const isDraft = scoreRecord && !scoreRecord.is_final;

              return (
                <div
                  key={sub.id}
                  className="bg-slate-900/30 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all shadow-md group"
                >
                  <div className="space-y-2 flex-grow max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400 uppercase bg-blue-950/45 px-2.5 py-0.5 rounded border border-blue-900/30">
                        {sub.teams?.name}
                      </span>
                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-450 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Graded (Locked)
                        </span>
                      ) : isDraft ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-450 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-full">
                          Draft Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded-full">
                          Pending Score
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">
                      {sub.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-850">
                    {/* Display score summary if evaluated */}
                    {scoreRecord && (
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-slate-500 block">Judge Score</span>
                        <span className="text-lg font-extrabold text-blue-400">
                          {Number(scoreRecord.criteria_scores.innovation) +
                            Number(scoreRecord.criteria_scores.impact) +
                            Number(scoreRecord.criteria_scores.technical) +
                            Number(scoreRecord.criteria_scores.presentation)}
                          <span className="text-xs text-slate-650 font-normal"> / 40</span>
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/judge/evaluate/${sub.id}`}
                      className={`w-full sm:w-auto text-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md ${
                        isGraded
                          ? 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-550/10'
                      }`}
                    >
                      {isGraded ? 'Review ScoreCard' : isDraft ? 'Resume Grading' : 'Grade Submission'}
                    </Link>
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
