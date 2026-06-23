'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Send, MessageSquare, Users, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MentorChatPage() {
  const [profile, setProfile] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  const channelRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, router]);

  useEffect(() => {
    // Scroll chat to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Fetch Profile
      const profRes = await fetch('/api/profile');
      if (!profRes.ok) throw new Error('Failed to fetch profile');
      const profJson = await profRes.json();
      const profData = profJson.profile;
      if (profData) {
        profData.id = profData._id;
        setProfile(profData);
      }

      // 2. Fetch Team
      const teamRes = await fetch('/api/hackathon/teams');
      if (!teamRes.ok) throw new Error('Failed to fetch team');
      const teamJson = await teamRes.json();
      const teamData = teamJson.team;

      if (teamData && profData) {
        teamData.id = teamData._id;
        setTeam(teamData);

        // Setup Supabase Realtime Broadcast channel
        const chan = supabase.channel(`team-chat-${teamData.id}`, {
          config: {
            broadcast: { self: true },
            presence: { key: profData.full_name },
          },
        });

        // Listen for messages
        chan.on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages((prev) => [...prev, payload]);
        });

        // Listen for presence state to show online members
        chan.on('presence', { event: 'sync' }, () => {
          const state = chan.presenceState();
          setActiveUsers(Object.keys(state));
        });

        chan.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track presence (join channel)
            await chan.track({ online_at: new Date().toISOString() });
            
            // Add a system announcement message
            setMessages((prev) => [
              ...prev,
              {
                system: true,
                text: `${profData.full_name} joined the chat workspace.`,
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        });

        channelRef.current = chan;
      }
    } catch (err) {
      console.error('Error fetching chat context:', err);
    }
    setLoading(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !channelRef.current || !profile) return;

    const payload = {
      senderId: profile.id,
      senderName: profile.full_name,
      senderRole: profile.role,
      avatarUrl: profile.avatar_url,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload,
    });

    setMessageText('');
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
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Team Chat Restricted</h3>
          <p className="text-slate-400 text-sm">
            Real-time chat is provided per team. Please join or create a team on the workspace dashboard to access your group chat.
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

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4 flex flex-col h-[75vh]">
        
        {/* Back Link */}
        <Link href="/hackathon/teams" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors self-start">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>

        {/* Layout Grid */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl min-h-[500px]">
          
          {/* Sidebar - active users */}
          <div className="md:col-span-1 border-r border-slate-850 p-5 space-y-6 bg-slate-950/40">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Chat</h3>
              <p className="text-slate-500 text-xs mt-1 truncate">{team.name}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Active Now ({activeUsers.length})
              </h4>
              <ul className="space-y-2 text-xs">
                {activeUsers.map((username, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="truncate">{username}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-3 flex flex-col justify-between h-full bg-slate-900/10">
            
            {/* Scrollable messages area */}
            <div
              ref={scrollRef}
              className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[50vh]"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-40 text-slate-655" />
                  <p className="text-xs">No active broadcasts. Send a message to start conversation!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  if (m.system) {
                    return (
                      <div key={idx} className="text-center">
                        <span className="inline-block bg-slate-950 text-[10px] text-slate-500 border border-slate-850 py-1 px-3 rounded-full">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = m.senderId === profile?.id;
                  const isMentor = m.senderRole === 'mentor';

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[70%] space-y-1 ${
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-350">{m.senderName}</span>
                        {isMentor && (
                          <span className="bg-sky-950 text-sky-400 border border-sky-900 px-1 py-0.2 rounded font-bold uppercase text-[9px]">
                            Mentor
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-3 rounded-xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : isMentor
                            ? 'bg-sky-950/60 border border-sky-900/50 text-slate-100 rounded-tl-none'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-750'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 bg-slate-950/50 flex gap-3">
              <input
                type="text"
                placeholder="Type your message to team and mentors..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-grow px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl text-white placeholder-slate-655 focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
}
