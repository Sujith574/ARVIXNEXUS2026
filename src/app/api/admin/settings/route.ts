import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import SystemSetting from '@/models/SystemSetting';
import HackathonRound from '@/models/HackathonRound';
import AuditLog from '@/models/AuditLog';

// GET: Fetch admin configurations and rounds list
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify admin permissions
    const profile = await Profile.findById(user.id);
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure default settings exist
    const defaultSettings = [
      { key: 'leaderboard_visible', value: true, description: 'Toggle visibility of the leaderboard' },
      { key: 'header_logo_label', value: 'Govt. of India', description: 'Logo small label text in Navbar' },
      { key: 'header_logo_title', value: 'National Hackathon Platform', description: 'Logo title text in Navbar' },
      { key: 'footer_logo_label', value: 'Government of India', description: 'Logo small label text in Footer' },
      { key: 'footer_logo_title', value: 'National Hackathon', description: 'Logo title text in Footer' },
      { key: 'footer_description', value: 'Organised by the Ministry of Electronics & Information Technology (MeitY), promoting developer innovation, digital governance, and national tech capacity building.', description: 'Description paragraph in Footer' },
      { key: 'footer_copyright', value: '© {year} National Launch & Hybrid Hackathon. All rights reserved.', description: 'Copyright notice in Footer' },
      { key: 'support_email', value: 'support@arvix2026.gov.in', description: 'Contact email in Footer' },
      { key: 'support_phone', value: '+91-11-2436-0199', description: 'Contact phone number in Footer' }
    ];

    const settingsObj: Record<string, any> = {};
    for (const item of defaultSettings) {
      let doc = await SystemSetting.findOne({ key: item.key });
      if (!doc) {
        doc = await SystemSetting.create(item);
      }
      settingsObj[item.key] = doc.value;
    }

    const rounds = await HackathonRound.find().sort({ round_number: 1 });

    return NextResponse.json({
      settings: settingsObj,
      rounds,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Manage settings actions (toggle, CRUD rounds)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify admin permissions
    const profile = await Profile.findById(user.id);
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'toggleLeaderboard') {
      const { visible } = body;
      if (typeof visible !== 'boolean') {
        return NextResponse.json({ error: 'Invalid visible flag' }, { status: 400 });
      }

      const setting = await SystemSetting.findOneAndUpdate(
        { key: 'leaderboard_visible' },
        { value: visible },
        { new: true, upsert: true }
      );

      await AuditLog.create({
        admin_id: user.id,
        action: 'TOGGLE_LEADERBOARD_VISIBILITY',
        details: { visible },
      });

      return NextResponse.json({ success: true, leaderboard_visible: setting.value });
    }

    if (action === 'addRound') {
      const { round_number, title, date, timeline, description } = body;
      if (!round_number || !title || !date || !timeline || !description) {
        return NextResponse.json({ error: 'Missing round details' }, { status: 400 });
      }

      // Check duplicate round number
      const existing = await HackathonRound.findOne({ round_number });
      if (existing) {
        return NextResponse.json({ error: `Round number ${round_number} already exists.` }, { status: 400 });
      }

      const round = await HackathonRound.create({
        round_number,
        title,
        date,
        timeline,
        description,
      });

      await AuditLog.create({
        admin_id: user.id,
        action: 'HACKATHON_ROUND_CREATION',
        details: { round_number, title },
      });

      return NextResponse.json({ success: true, round });
    }

    if (action === 'editRound') {
      const { id, round_number, title, date, timeline, description } = body;
      if (!id || !round_number || !title || !date || !timeline || !description) {
        return NextResponse.json({ error: 'Missing round details' }, { status: 400 });
      }

      // Check if duplicate round number exists for other round documents
      const existing = await HackathonRound.findOne({ round_number, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: `Another round with number ${round_number} already exists.` }, { status: 400 });
      }

      const round = await HackathonRound.findByIdAndUpdate(
        id,
        { round_number, title, date, timeline, description },
        { new: true }
      );

      if (!round) {
        return NextResponse.json({ error: 'Hackathon round not found' }, { status: 404 });
      }

      await AuditLog.create({
        admin_id: user.id,
        action: 'HACKATHON_ROUND_UPDATE',
        details: { round_number, title },
      });

      return NextResponse.json({ success: true, round });
    }

    if (action === 'deleteRound') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Missing round ID' }, { status: 400 });
      }

      const round = await HackathonRound.findByIdAndDelete(id);

      if (!round) {
        return NextResponse.json({ error: 'Hackathon round not found' }, { status: 404 });
      }

      await AuditLog.create({
        admin_id: user.id,
        action: 'HACKATHON_ROUND_DELETION',
        details: { round_number: round.round_number, title: round.title },
      });

      return NextResponse.json({ success: true, message: 'Round deleted.' });
    }

    if (action === 'updateSiteSettings') {
      const { settings } = body;
      if (!settings || typeof settings !== 'object') {
        return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
      }

      for (const [key, value] of Object.entries(settings)) {
        await SystemSetting.findOneAndUpdate(
          { key },
          { value },
          { new: true, upsert: true }
        );
      }

      await AuditLog.create({
        admin_id: user.id,
        action: 'UPDATE_SITE_SETTINGS',
        details: { keys: Object.keys(settings) },
      });

      return NextResponse.json({ success: true, message: 'Settings updated successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
