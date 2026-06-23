import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import EventAgenda from '@/models/EventAgenda';
import Invitation from '@/models/Invitation';
import VipDocument from '@/models/VipDocument';
import AuditLog from '@/models/AuditLog';

// GET: Fetch administrative data for the launch event
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

    // Ensure Profile is registered
    const _dummyProfile = Profile.modelName;

    // Fetch agenda ordered by start time
    const agendaList = await EventAgenda.find().sort({ start_time: 1 });
    const formattedAgenda = agendaList.map((item) => ({
      ...item.toObject(),
      id: item._id.toString(),
    }));

    // Fetch invitations ordered by date
    const invites = await Invitation.find().sort({ createdAt: -1 });
    const formattedInvites = invites.map((inv) => ({
      ...inv.toObject(),
      id: inv._id.toString(),
    }));

    // Fetch VIP profiles (admins, super_admins, and participants who can receive VIP papers)
    const vipList = await Profile.find({
      role: { $in: ['admin', 'super_admin', 'participant'] },
    }).sort({ full_name: 1 });
    
    const formattedVips = vipList.map((v) => ({
      ...v.toObject(),
      id: v._id.toString(),
    }));

    // Fetch VIP Documents
    const docs = await VipDocument.find().populate('visible_to_profile_id');
    const formattedDocs = docs.map((doc) => {
      const visibleToDoc = doc.visible_to_profile_id as any;
      return {
        ...doc.toObject(),
        id: doc._id.toString(),
        profiles: visibleToDoc ? { full_name: visibleToDoc.full_name } : null,
      };
    });

    return NextResponse.json({
      agenda: formattedAgenda,
      invitations: formattedInvites,
      vips: formattedVips,
      vipDocs: formattedDocs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Handle creations and logging actions
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

    if (action === 'addAgenda') {
      const { title, description, start_time, end_time, type } = body;
      if (!title || !start_time || !end_time || !type) {
        return NextResponse.json({ error: 'Missing agenda slot fields' }, { status: 400 });
      }

      const agendaItem = await EventAgenda.create({
        title,
        description: description || '',
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        type,
      });

      await AuditLog.create({
        admin_id: user.id,
        action: 'AGENDA_ITEM_CREATION',
        details: { title, agenda_id: agendaItem._id },
      });

      return NextResponse.json({ success: true, agendaItem });
    }

    if (action === 'createInvitation') {
      const { code, invitee_name, email, type, max_uses } = body;
      if (!code || !invitee_name || !email || !type || !max_uses) {
        return NextResponse.json({ error: 'Missing invitation parameters' }, { status: 400 });
      }

      const invite = await Invitation.create({
        code,
        invitee_name,
        email,
        type,
        max_uses,
        times_used: 0,
        is_active: true,
      });

      await AuditLog.create({
        admin_id: user.id,
        action: 'INVITATION_CODE_CREATION',
        details: { code, invitee: invitee_name, email },
      });

      return NextResponse.json({ success: true, invite });
    }

    if (action === 'uploadVipDoc') {
      const { title, file_url, visible_to_profile_id } = body;
      if (!title || !file_url || !visible_to_profile_id) {
        return NextResponse.json({ error: 'Missing document fields' }, { status: 400 });
      }

      const doc = await VipDocument.create({
        title,
        file_url,
        visible_to_profile_id,
        uploaded_by: user.id,
      });

      const selectedVip = await Profile.findById(visible_to_profile_id);

      await AuditLog.create({
        admin_id: user.id,
        action: 'VIP_DOCUMENT_UPLOAD',
        details: { title, visible_to: selectedVip?.full_name || visible_to_profile_id },
      });

      return NextResponse.json({ success: true, doc });
    }

    if (action === 'logStageCue') {
      const { vipId, message } = body;
      if (!vipId || !message) {
        return NextResponse.json({ error: 'Missing stage cue parameters' }, { status: 400 });
      }

      const selectedVip = await Profile.findById(vipId);

      await AuditLog.create({
        admin_id: user.id,
        action: 'VIP_STAGE_CUE_BROADCAST',
        details: { target: selectedVip?.full_name || vipId, message },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
