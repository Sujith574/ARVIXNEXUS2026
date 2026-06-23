import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import AuditLog from '@/models/AuditLog';

// GET: List all user profiles
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

    // Fetch all profiles sorted by registration date
    const profiles = await Profile.find().sort({ createdAt: -1 });
    const formattedProfiles = profiles.map((p) => ({
      ...p.toObject(),
      id: p._id.toString(),
      created_at: p.createdAt,
    }));

    return NextResponse.json({ users: formattedProfiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Modify a user's role and write audit logs
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify admin permissions
    const currentProfile = await Profile.findById(currentUser.id);
    if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'User ID and new role are required.' }, { status: 400 });
    }

    const targetProfile = await Profile.findById(userId);
    if (!targetProfile) {
      return NextResponse.json({ error: 'Target profile not found.' }, { status: 404 });
    }

    const oldRole = targetProfile.role;

    // Update role in MongoDB Profile document
    targetProfile.role = newRole;
    await targetProfile.save();

    // Update role in Supabase Auth user metadata too!
    // This is critical because our middleware relies on Supabase user metadata for role check
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole },
    });

    // Write audit log document
    await AuditLog.create({
      admin_id: currentUser.id,
      action: 'USER_ROLE_MUTATION',
      details: {
        target_user_id: userId,
        target_user_name: targetProfile.full_name,
        old_role: oldRole,
        new_role: newRole,
      },
    });

    return NextResponse.json({ success: true, message: `Role updated for ${targetProfile.full_name}.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
