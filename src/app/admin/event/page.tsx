'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Plus, Mail, ShieldAlert, Loader2, Key, Bell, FileText, Send, Trash2 } from 'lucide-react';

export default function EventManagementPage() {
  const [agenda, setAgenda] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [vips, setVips] = useState<any[]>([]);
  const [vipDocs, setVipDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Agenda Form
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDesc, setAgendaDesc] = useState('');
  const [agendaStart, setAgendaStart] = useState('');
  const [agendaEnd, setAgendaEnd] = useState('');
  const [agendaType, setAgendaType] = useState('session');

  // Invitation Form
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeType, setInviteeType] = useState('VIP');
  const [inviteMaxUses, setInviteMaxUses] = useState(1);

  // VIP Document Form
  const [docTitle, setDocTitle] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docVisibleTo, setDocVisibleTo] = useState('');

  // Cue Form
  const [cueVipId, setCueVipId] = useState('');
  const [cueMessage, setCueMessage] = useState('');

  // General Loading & Feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/event');
      if (!res.ok) throw new Error('Failed to fetch event data');
      const data = await res.json();
      setAgenda(data.agenda || []);
      setInvitations(data.invitations || []);
      setVips(data.vips || []);
      setVipDocs(data.vipDocs || []);
    } catch (err) {
      console.error('Error fetching event data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaTitle.trim() || !agendaStart || !agendaEnd) return;
    setActionLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addAgenda',
          title: agendaTitle.trim(),
          description: agendaDesc.trim() || null,
          start_time: new Date(agendaStart).toISOString(),
          end_time: new Date(agendaEnd).toISOString(),
          type: agendaType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish agenda slot.');

      setMsg({ type: 'success', text: 'Agenda slot published successfully!' });
      setAgendaTitle('');
      setAgendaDesc('');
      setAgendaStart('');
      setAgendaEnd('');
      await fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeName.trim() || !inviteeEmail.trim()) return;
    setActionLoading(true);
    setMsg(null);

    const code = `${inviteeType.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createInvitation',
          code,
          invitee_name: inviteeName.trim(),
          email: inviteeEmail.trim(),
          type: inviteeType,
          max_uses: inviteMaxUses,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate code.');

      setMsg({ type: 'success', text: `Invitation code ${code} generated.` });
      setInviteeName('');
      setInviteeEmail('');
      setInviteMaxUses(1);
      await fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadVipDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileUrl.trim() || !docVisibleTo) return;
    setActionLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'uploadVipDoc',
          title: docTitle.trim(),
          file_url: docFileUrl.trim(),
          visible_to_profile_id: docVisibleTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload document.');

      setMsg({ type: 'success', text: 'VIP Briefing Document assigned successfully.' });
      setDocTitle('');
      setDocFileUrl('');
      setDocVisibleTo('');
      await fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendStageCue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cueVipId || !cueMessage.trim()) return;
    setActionLoading(true);
    setMsg(null);

    // Broadcast live stage cue using Supabase Broadcast Channel
    const channel = supabase.channel(`vip-cues-${cueVipId}`);
    
    // Broadcast trigger
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'stage-cue',
          payload: { message: cueMessage.trim() },
        });

        try {
          const res = await fetch('/api/admin/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'logStageCue',
              vipId: cueVipId,
              message: cueMessage.trim(),
            }),
          });
          
          if (!res.ok) {
            console.error('Failed to log stage cue in audit log');
          }
        } catch (err) {
          console.error('Audit log cue error:', err);
        }

        const selectedVip = vips.find((v) => v.id === cueVipId);
        setMsg({ type: 'success', text: `Stage cue broadcast sent to ${selectedVip?.full_name}!` });
        setCueMessage('');
        setActionLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Launch Event Manager</h2>
        <p className="text-slate-400 text-xs mt-1">Deploy schedules, manage press access tiers, dispatch VIP documents, and push live stage cues.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Agenda Slot Management */}
        <div className="space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Event Agenda Slots
          </h3>

          <form onSubmit={handleAddAgenda} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Agenda Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Technology Stack Keynote"
                value={agendaTitle}
                onChange={(e) => setAgendaTitle(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={agendaStart}
                  onChange={(e) => setAgendaStart(e.target.value)}
                  className="block w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={agendaEnd}
                  onChange={(e) => setAgendaEnd(e.target.value)}
                  className="block w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Agenda Type
              </label>
              <select
                value={agendaType}
                onChange={(e) => setAgendaType(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="session">Session</option>
                <option value="keynote">Keynote</option>
                <option value="break">Break</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !agendaTitle.trim() || !agendaStart}
              className="w-full flex items-center justify-center gap-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-md disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Publish Slot
            </button>
          </form>

          {/* List of slots */}
          <div className="pt-4 border-t border-slate-850 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {agenda.map((slot) => (
              <div key={slot.id} className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg text-[11px] text-slate-400">
                <span className="font-semibold text-white block">{slot.title}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Reservation Codes & RSVPs */}
        <div className="space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-500" /> Reservation Code Generator
          </h3>

          <form onSubmit={handleCreateInvitation} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Invitee Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cabinet Sec. Secretary"
                value={inviteeName}
                onChange={(e) => setInviteeName(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. cabin-sec@nic.in"
                value={inviteeEmail}
                onChange={(e) => setInviteeEmail(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Invite Type
                </label>
                <select
                  value={inviteeType}
                  onChange={(e) => setInviteeType(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="VIP">VIP Guest</option>
                  <option value="press">Press / Media</option>
                  <option value="public">Public Guest</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Max Claims
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={500}
                  value={inviteMaxUses}
                  onChange={(e) => setInviteMaxUses(Number(e.target.value))}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none animate-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !inviteeName.trim() || !inviteeEmail.trim()}
              className="w-full flex items-center justify-center gap-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-md disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Generate Code
            </button>
          </form>

          {/* List of generated invites */}
          <div className="pt-4 border-t border-slate-855 space-y-2 max-h-[170px] overflow-y-auto pr-1">
            {invitations.map((inv) => (
              <div key={inv.id} className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg text-[10px] text-slate-450 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">{inv.code}</span>
                  <span className="text-slate-550 block mt-0.5">{inv.invitee_name} ({inv.type})</span>
                </div>
                <div className="text-right text-slate-500">
                  Claims: <span className="font-bold text-white">{inv.times_used}</span> / {inv.max_uses}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: VIP Command Room (Docs & Realtime Cues) */}
        <div className="space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md">
          
          {/* Briefing Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Secure VIP Briefings
            </h3>

            <form onSubmit={handleUploadVipDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage cues & Protocol briefing"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  File URL (from Storage / Cloud)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://your-domain/briefing.pdf"
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Assign to VIP Guest
                </label>
                <select
                  value={docVisibleTo}
                  onChange={(e) => setDocVisibleTo(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="">Select Target Guest...</option>
                  {vips.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.full_name} ({v.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading || !docTitle.trim() || !docVisibleTo}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" /> Assign Document
              </button>
            </form>
          </div>

          {/* Real-time Stage Cues */}
          <div className="space-y-4 pt-4 border-t border-slate-850">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Push Stage Cues
            </h3>

            <form onSubmit={handleSendStageCue} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Target VIP Guest
                </label>
                <select
                  value={cueVipId}
                  onChange={(e) => setCueVipId(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                >
                  <option value="">Select Active Guest...</option>
                  {vips.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Cue Message Alert
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Please proceed to Podium 2 for inaugural speech."
                  value={cueMessage}
                  onChange={(e) => setCueMessage(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-655 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !cueVipId || !cueMessage.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 shadow-md"
              >
                <Send className="w-3.5 h-3.5" /> Push Live Cue Alert
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
