import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SystemSetting from '@/models/SystemSetting';

export async function GET() {
  try {
    await dbConnect();
    const settingsList = await SystemSetting.find({});
    const settings: Record<string, any> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    // Provide default fallback values if any setting is missing
    const defaults: Record<string, any> = {
      header_logo_label: 'Govt. of India',
      header_logo_title: 'National Hackathon Platform',
      footer_logo_label: 'Government of India',
      footer_logo_title: 'National Hackathon',
      footer_description: 'Organised by the Ministry of Electronics & Information Technology (MeitY), promoting developer innovation, digital governance, and national tech capacity building.',
      footer_copyright: '© {year} National Launch & Hybrid Hackathon. All rights reserved.',
      support_email: 'support@arvix2026.gov.in',
      support_phone: '+91-11-2436-0199',
      leaderboard_visible: true,
    };

    const merged = { ...defaults, ...settings };

    // Format year placeholder in footer copyright
    if (merged.footer_copyright && typeof merged.footer_copyright === 'string') {
      merged.footer_copyright = merged.footer_copyright.replace('{year}', new Date().getFullYear().toString());
    }

    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
