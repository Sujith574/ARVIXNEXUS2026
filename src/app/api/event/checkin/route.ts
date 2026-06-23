import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Rsvp from '@/models/Rsvp';
import Profile from '@/models/Profile';

// GET: Fetch check-in statistics and recent arrivals
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

    const totalCount = await Rsvp.countDocuments();
    const checkinCount = await Rsvp.countDocuments({ checkin_time: { $ne: null } });

    const recentCheckins = await Rsvp.find({ checkin_time: { $ne: null } })
      .sort({ checkin_time: -1 })
      .limit(5);

    const formattedRecents = recentCheckins.map((rc) => ({
      ...rc.toObject(),
      id: rc._id.toString(),
    }));

    return NextResponse.json({
      totalCount,
      checkinCount,
      recentCheckins: formattedRecents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Mark an attendee as checked-in by ticket code
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
    const { ticketCode } = body;

    if (!ticketCode || !ticketCode.trim()) {
      return NextResponse.json({ error: 'Ticket code is required.' }, { status: 400 });
    }

    // Find RSVP record
    const rsvpRecord = await Rsvp.findOne({ qr_code_data: ticketCode.trim() });
    if (!rsvpRecord) {
      return NextResponse.json({ error: 'Ticket code not found in RSVP e-Registry.' }, { status: 404 });
    }

    if (rsvpRecord.checkin_time) {
      return NextResponse.json({
        alreadyCheckedIn: true,
        name: rsvpRecord.name,
        checkin_time: rsvpRecord.checkin_time,
      });
    }

    // Mark check-in
    rsvpRecord.checkin_time = new Date();
    const updatedRsvp = await rsvpRecord.save();

    return NextResponse.json({
      success: true,
      rsvp: {
        ...updatedRsvp.toObject(),
        id: updatedRsvp._id.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
