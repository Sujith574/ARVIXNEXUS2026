'use client';

import { useState } from 'react';
import { Download, FileText, Image as ImageIcon, Volume2, Globe, Calendar, Award, Loader2 } from 'lucide-react';

const PRESS_RELEASES = [
  { date: 'June 22, 2026', title: 'MeitY Announces National Launch Ceremony and Hybrid Innovation Hackathon', category: 'Announcement', size: '240 KB' },
  { date: 'June 18, 2026', title: 'Government Invites Top 100 Innovation Teams to Showcase at Vigyan Bhawan', category: 'Invitation', size: '185 KB' },
  { date: 'June 10, 2026', title: 'Unveiling the Digital India Stack 2.0 - Technical Briefing Notes for Media', category: 'Briefing', size: '1.2 MB' }
];

const PRESS_PHOTOS = [
  { title: 'Vigyan Bhawan Main Plenary Hall', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop', category: 'Venue' },
  { title: 'MeitY National Data Center', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop', category: 'Tech' },
  { title: 'Inaugural Launch Remote Console', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop', category: 'Console' }
];

export default function PressKitPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (fileName: string) => {
    setDownloading(fileName);
    setTimeout(() => setDownloading(null), 1000);
  };

  return (
    <div className="flex-grow bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Media Center</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Digital Press Kit
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Welcome to the official press room. Download embargoed announcements, high-resolution media photos, and speaker details for reporting.
          </p>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Press Releases Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Press Releases & Briefs
                </h3>
                <p className="text-slate-500 text-xs mt-1">Official circulars issued by the Ministry Media Desk.</p>
              </div>

              <div className="space-y-4">
                {PRESS_RELEASES.map((pr, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 border border-slate-850 hover:border-slate-800 rounded-xl flex justify-between items-center gap-6 transition-colors">
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">{pr.category}</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-505 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {pr.date}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white leading-snug">{pr.title}</h4>
                    </div>

                    <button
                      onClick={() => handleDownload(pr.title)}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all shrink-0"
                    >
                      {downloading === pr.title ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span>{pr.size}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Media Kit Info Column */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-400" /> Media Contacts
                </h3>
                <p className="text-slate-500 text-xs mt-1">Liaison contacts for journalism inquiries.</p>
              </div>

              <div className="bg-slate-955 p-4 border border-slate-850 rounded-xl space-y-3 text-xs text-slate-350">
                <div>
                  <span className="text-slate-500 font-semibold block uppercase">MeitY Press Secretary</span>
                  <span className="font-semibold text-white block mt-0.5">Shri Aniket Sen, IIS</span>
                  <span className="block mt-0.5">Email: media-desk@meity.gov.in</span>
                  <span>Phone: +91 11 2430 XXXX</span>
                </div>
                <div className="pt-2 border-t border-slate-850">
                  <span className="text-slate-500 font-semibold block uppercase">Vigyan Bhawan Media Room</span>
                  <span className="font-semibold text-white block mt-0.5">Press Briefing Desk #B</span>
                  <span>Hours: 08:00 AM - 06:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Gallery */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-400" /> Official Media Gallery
                </h3>
                <p className="text-slate-505 text-xs mt-1">High-resolution photography approved for news publications.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {PRESS_PHOTOS.map((ph, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-855 rounded-xl overflow-hidden group shadow-md">
                    <img src={ph.url} alt={ph.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-4 flex justify-between items-center gap-4">
                      <div>
                        <span className="text-[9px] bg-slate-900 text-slate-400 py-0.5 px-2 rounded font-bold uppercase tracking-wider">{ph.category}</span>
                        <h4 className="font-semibold text-xs text-white truncate mt-1 max-w-[180px]">{ph.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDownload(ph.title)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-805 text-slate-400 hover:text-white rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
