'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, Save, Loader2, Eye, EyeOff, Info } from 'lucide-react';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({
    header_logo_label: '',
    header_logo_title: '',
    footer_logo_label: '',
    footer_logo_title: '',
    footer_description: '',
    footer_copyright: '',
    support_email: '',
    support_phone: '',
    leaderboard_visible: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, [supabase]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSiteSettings',
          settings,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setMsg({ type: 'success', text: 'Site settings updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Site Configuration Settings
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Customize titles, metadata, footer support contacts, and public visibility options live across the platform.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg text-sm text-center border ${
            msg.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-350'
              : 'bg-rose-950/30 border-rose-900/50 text-rose-350'
          }`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Header/Navbar Branding */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <span>Header & Navigation Branding</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Navbar Logo Label
              </label>
              <input
                type="text"
                value={settings.header_logo_label}
                onChange={(e) => handleInputChange('header_logo_label', e.target.value)}
                placeholder="e.g. Govt. of India"
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Displayed in orange uppercase format above the main title.</span>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Navbar Brand Title
              </label>
              <input
                type="text"
                value={settings.header_logo_title}
                onChange={(e) => handleInputChange('header_logo_title', e.target.value)}
                placeholder="e.g. National Hackathon Platform"
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">The main platform brand text shown next to the landmark logo.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Footer Branding & Support */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
            Footer Branding & Support Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Footer Logo Label
              </label>
              <input
                type="text"
                value={settings.footer_logo_label}
                onChange={(e) => handleInputChange('footer_logo_label', e.target.value)}
                placeholder="e.g. Government of India"
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Footer Brand Title
              </label>
              <input
                type="text"
                value={settings.footer_logo_title}
                onChange={(e) => handleInputChange('footer_logo_title', e.target.value)}
                placeholder="e.g. National Hackathon"
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Footer Description Text
              </label>
              <textarea
                rows={3}
                value={settings.footer_description}
                onChange={(e) => handleInputChange('footer_description', e.target.value)}
                placeholder="Enter organization details, organizers or partner info..."
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Support Contact Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleInputChange('support_email', e.target.value)}
                placeholder="support@arvix2026.gov.in"
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Support Contact Phone
              </label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => handleInputChange('support_phone', e.target.value)}
                placeholder="+91-11-2436-0199"
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Footer Copyright notice
              </label>
              <input
                type="text"
                value={settings.footer_copyright}
                onChange={(e) => handleInputChange('footer_copyright', e.target.value)}
                placeholder="e.g. © {year} National Launch. All rights reserved."
                required
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Use <code className="bg-slate-950 py-0.5 px-1 rounded text-primary">{`{year}`}</code> to dynamically render the current calendar year.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Feature Visibilities */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
            Feature Flag Access Visibilities
          </h3>

          <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-850">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {settings.leaderboard_visible ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-rose-400" />
                )}
                Public Leaderboard Visibility
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Toggle whether participants can view the grading leaderboard tab. Turn off during active judging segments if desired.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleInputChange('leaderboard_visible', !settings.leaderboard_visible)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.leaderboard_visible ? 'bg-primary' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.leaderboard_visible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Configurations...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Site Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
