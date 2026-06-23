import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

// POST: Manually create a user
export async function POST(request: Request) {
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
    const { full_name, email, password, role } = body;

    if (!full_name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required.' }, { status: 400 });
    }

    // 1. Check if user already exists in MongoDB
    const existing = await Profile.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
    }

    // 2. Create in Supabase Auth via Admin Client
    const supabaseAdmin = createAdminClient();
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name,
      },
    });

    if (authCreateError || !authData.user) {
      return NextResponse.json({ error: authCreateError?.message || 'Failed to create auth user.' }, { status: 500 });
    }

    // 3. Create in MongoDB
    const newProfile = await Profile.create({
      _id: authData.user.id,
      full_name,
      email,
      role,
      is_speaker: false,
      skills: [],
    });

    // 4. Log Administrative Action
    await AuditLog.create({
      admin_id: currentUser.id,
      action: 'USER_CREATION',
      details: {
        created_user_id: newProfile._id,
        created_user_name: full_name,
        created_user_email: email,
        role,
      },
    });

    return NextResponse.json({ success: true, message: `User ${full_name} created successfully.`, user: newProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Modify a user's details and metadata
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
    const {
      userId,
      full_name,
      phone,
      github,
      linkedin,
      skills,
      avatar_url,
      is_speaker,
      organization,
      bio,
      role,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const targetProfile = await Profile.findById(userId);
    if (!targetProfile) {
      return NextResponse.json({ error: 'Target profile not found.' }, { status: 404 });
    }

    const oldRole = targetProfile.role;
    const oldName = targetProfile.full_name;

    // Update MongoDB Profile document
    if (full_name !== undefined) targetProfile.full_name = full_name;
    if (phone !== undefined) targetProfile.phone = phone;
    if (github !== undefined) targetProfile.github = github;
    if (linkedin !== undefined) targetProfile.linkedin = linkedin;
    if (avatar_url !== undefined) targetProfile.avatar_url = avatar_url;
    if (is_speaker !== undefined) targetProfile.is_speaker = is_speaker;
    if (organization !== undefined) targetProfile.organization = organization;
    if (bio !== undefined) targetProfile.bio = bio;
    if (role !== undefined) targetProfile.role = role;

    if (skills !== undefined) {
      targetProfile.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    await targetProfile.save();

    // Update Supabase Auth user metadata too
    const supabaseAdmin = createAdminClient();
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: role !== undefined ? role : oldRole,
        full_name: full_name !== undefined ? full_name : oldName,
      },
    });

    if (authUpdateError) {
      console.error('Supabase user auth metadata update error:', authUpdateError);
    }

    // Write audit log document
    await AuditLog.create({
      admin_id: currentUser.id,
      action: 'USER_PROFILE_MUTATION',
      details: {
        target_user_id: userId,
        target_user_name: targetProfile.full_name,
        old_role: oldRole,
        new_role: targetProfile.role,
        is_speaker: targetProfile.is_speaker,
      },
    });

    return NextResponse.json({ success: true, message: `Profile updated for ${targetProfile.full_name}.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete user from Supabase and MongoDB
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify admin permissions (must be super_admin or admin to delete users)
    const currentProfile = await Profile.findById(currentUser.id);
    if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    const targetProfile = await Profile.findById(userId);
    if (!targetProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    // 1. Delete from Supabase Auth via Admin Client
    const supabaseAdmin = createAdminClient();
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      // If auth user not found or already deleted, proceed to delete profile
      console.warn('Supabase delete user warning/error:', deleteError);
    }

    // 2. Delete from MongoDB
    await Profile.findByIdAndDelete(userId);

    // 3. Log Administrative Action
    await AuditLog.create({
      admin_id: currentUser.id,
      action: 'USER_DELETION',
      details: {
        deleted_user_id: userId,
        deleted_user_name: targetProfile.full_name,
        deleted_user_email: targetProfile.email,
      },
    });

    return NextResponse.json({ success: true, message: `User ${targetProfile.full_name} deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
