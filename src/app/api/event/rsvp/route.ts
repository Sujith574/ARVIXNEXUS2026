import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invitation from '@/models/Invitation';
import Rsvp from '@/models/Rsvp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, email, phone } = body;

    if (!code || !name || !email) {
      return NextResponse.json({ error: 'Invitation code, name, and email are required.' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch invitation from MongoDB
    const invite = await Invitation.findOne({ code: code.trim().toUpperCase() });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invitation code.' }, { status: 404 });
    }

    if (!invite.is_active) {
      return NextResponse.json({ error: 'This invitation code is no longer active.' }, { status: 403 });
    }

    if (invite.times_used >= invite.max_uses) {
      return NextResponse.json({ error: 'This invitation code has already reached its maximum usage limit.' }, { status: 403 });
    }

    // 2. Create RSVP
    const qrCodeData = `rsvp-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const rsvp = await Rsvp.create({
      invitation_id: invite._id,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      confirmed: true,
      qr_code_data: qrCodeData,
    });

    // 3. Increment times_used on invitation
    invite.times_used = invite.times_used + 1;
    await invite.save();

    return NextResponse.json({
      success: true,
      rsvp: {
        id: rsvp._id,
        name: rsvp.name,
        email: rsvp.email,
        qr_code_data: rsvp.qr_code_data,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Validation check endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
    }

    await dbConnect();

    const invite = await Invitation.findOne({ code: code.trim().toUpperCase() });

    if (!invite) {
      return NextResponse.json({ valid: false, error: 'Invalid invitation code.' });
    }

    if (!invite.is_active || invite.times_used >= invite.max_uses) {
      return NextResponse.json({ valid: false, error: 'Invitation code has expired or been used.' });
    }

    return NextResponse.json({
      valid: true,
      invitee_name: invite.invitee_name,
      email: invite.email,
      type: invite.type,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
