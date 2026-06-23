'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileCode, Eye, CheckCircle, Lock, Loader2, Link as LinkIcon, AlertTriangle, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  const [profile, setProfile] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [uploadingScreen, setUploadingScreen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [documentUrl, setDocumentUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const DEADLINE = new Date('2026-07-31T23:59:59Z');
  const isPastDeadline = new Date() > DEADLINE;

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

      // 1. Fetch Profile from MongoDB API
      const profRes = await fetch('/api/profile');
      if (!profRes.ok) throw new Error('Failed to fetch profile');
      const profJson = await profRes.json();
      const prof = profJson.profile;
      if (prof) {
        prof.id = prof._id;
        setProfile(prof);
      }

      // 2. Fetch Team from MongoDB API
      const teamRes = await fetch('/api/hackathon/teams');
      if (!teamRes.ok) throw new Error('Failed to fetch team');
      const teamJson = await teamRes.json();
      const teamData = teamJson.team;

      if (teamData) {
        teamData.id = teamData._id;
        setTeam(teamData);

        // 3. Fetch Submission from MongoDB API
        const subRes = await fetch('/api/hackathon/submit');
        if (subRes.ok) {
          const subJson = await subRes.json();
          const subData = subJson.submission;
          if (subData) {
            setSubmission(subData);
            setTitle(subData.title || '');
            setDescription(subData.description || '');
            setRepoUrl(subData.repo_url || '');
            setLiveUrl(subData.live_url || '');
            setDemoVideoUrl(subData.demo_video_url || '');
            setScreenshots(subData.screenshots || []);
            setDocumentUrl(subData.document_url || '');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching submission context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'screenshot' | 'doc') => {
    if (!e.target.files || e.target.files.length === 0 || !team) return;
    const file = e.target.files[0];
    
    if (type === 'screenshot') {
      if (screenshots.length >= 3) {
        setMsg({ type: 'error', text: 'You can upload a maximum of 3 screenshots.' });
        return;
      }
      setUploadingScreen(true);
    } else {
      setUploadingDoc(true);
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `submissions/${team.id}/${type}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('submission-files')
      .upload(filePath, file);

    if (error) {
      setMsg({ type: 'error', text: `Upload failed: ${error.message}` });
      setUploadingScreen(false);
      setUploadingDoc(false);
      return;
    }

    // Get public URL or path reference (we'll save the path reference for RLS verification)
    const storedPath = filePath;

    if (type === 'screenshot') {
      setScreenshots([...screenshots, storedPath]);
      setUploadingScreen(false);
    } else {
      setDocumentUrl(storedPath);
      setUploadingDoc(false);
    }
    setMsg({ type: 'success', text: 'File uploaded successfully!' });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isFinalSubmit: boolean) => {
    setSaving(true);
    setMsg(null);

    const response = await fetch('/api/hackathon/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        repo_url: repoUrl,
        live_url: liveUrl,
        demo_video_url: demoVideoUrl,
        screenshots,
        document_url: documentUrl,
        isFinalSubmit,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMsg({ type: 'error', text: data.error || 'Something went wrong.' });
    } else {
      setMsg({ type: 'success', text: data.message });
      fetchData(); // Reload details
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex-grow bg-slate-950 flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm max-w-md text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-455">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Team Required</h3>
          <p className="text-slate-400 text-sm">
            You must be part of an official team to submit your hackathon project. Join or create a team on the workspace dashboard first.
          </p>
          <Link
            href="/hackathon/teams"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            Go to Team Workspace
          </Link>
        </div>
      </div>
    );
  }

  const isCaptain = team.captain_id === profile.id;
  const isLocked = submission?.status === 'submitted';
  const readOnly = !isCaptain || isLocked || isPastDeadline;

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Project Submission</h2>
            <p className="text-slate-400 text-sm mt-1">
              Team: <span className="font-semibold text-white">{team.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Locked & Submitted
              </span>
            ) : isPastDeadline ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-950/40 border border-rose-900/60 text-rose-400">
                <Lock className="w-3.5 h-3.5" /> Deadline Passed
              </span>
            ) : !isCaptain ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400">
                <Eye className="w-3.5 h-3.5" /> Read-Only Mode (Member)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-950/40 border border-blue-900/40 text-blue-400 animate-pulse">
                Draft Editing (Captain)
              </span>
            )}
          </div>
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

        <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-6">
          <div className="space-y-4">
            
            {/* Project Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Project Title
              </label>
              <input
                type="text"
                required
                disabled={readOnly}
                placeholder="e.g. CleanGov AI Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description / Problem Solving details
              </label>
              <textarea
                rows={5}
                required
                disabled={readOnly}
                placeholder="Describe your architecture, the stack you used, and how it solves the selected problem statement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub Repo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileCode className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="url"
                    required
                    disabled={readOnly}
                    placeholder="https://github.com/org/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Deployed Live Link */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Live Website Link (Deployed URL)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="url"
                    required
                    disabled={readOnly}
                    placeholder="https://your-project.vercel.app"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Demo Video URL (YouTube/Vimeo - Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="url"
                  disabled={readOnly}
                  placeholder="https://youtu.be/..."
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                />
              </div>
            </div>

          </div>

          {/* Buttons Area */}
          {!readOnly && (
            <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="w-full sm:w-auto py-2.5 px-6 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              >
                Save as Draft
              </button>
              
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/10 disabled:opacity-50"
              >
                Final Submission (Lock)
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
