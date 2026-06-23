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
    let leaderboardSetting = await SystemSetting.findOne({ key: 'leaderboard_visible' });
    if (!leaderboardSetting) {
      leaderboardSetting = await SystemSetting.create({
        key: 'leaderboard_visible',
        value: true,
        description: 'Toggle visibility of the leaderboard for all users',
      });
    }

    const rounds = await HackathonRound.find().sort({ round_number: 1 });

    return NextResponse.json({
      leaderboard_visible: leaderboardSetting.value,
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
