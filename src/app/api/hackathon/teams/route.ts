import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';
import Profile from '@/models/Profile';
import AuditLog from '@/models/AuditLog';

// GET: Fetch team and members for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find user's team membership
    const memberRecord = await TeamMember.findOne({ profile_id: user.id });
    if (!memberRecord) {
      return NextResponse.json({ team: null, members: [] });
    }

    // Fetch team details
    const team = await Team.findById(memberRecord.team_id);
    if (!team) {
      return NextResponse.json({ team: null, members: [] });
    }

    // Fetch all members of this team
    const teamMembers = await TeamMember.find({ team_id: team._id });
    const profileIds = teamMembers.map((m) => m.profile_id);
    const profiles = await Profile.find({ _id: { $in: profileIds } });

    // Format list
    const membersList = teamMembers.map((tm) => {
      const prof = profiles.find((p) => p._id === tm.profile_id);
      return {
        joined_at: tm.joinedAt,
        profiles: prof,
      };
    });

    return NextResponse.json({ team, members: membersList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new team
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Team name is required.' }, { status: 400 });
    }

    await dbConnect();

    // Verify user is not already in a team
    const existingMembership = await TeamMember.findOne({ profile_id: user.id });
    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member of a team.' }, { status: 400 });
    }

    // Verify team name unique
    const existingTeam = await Team.findOne({ name: name.trim() });
    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already exists.' }, { status: 400 });
    }

    // Generate random code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create team document
    const team = await Team.create({
      name: name.trim(),
      captain_id: user.id,
      code,
    });

    // Create team membership document for captain
    await TeamMember.create({
      team_id: team._id,
      profile_id: user.id,
    });

    // Audit log
    await AuditLog.create({
      admin_id: user.id,
      action: 'TEAM_ESTABLISHED',
      details: { team_id: team._id, name: team.name },
    });

    return NextResponse.json({ success: true, team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Join an existing team via invite code
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 });
    }

    await dbConnect();

    // Verify user not in team
    const existingMembership = await TeamMember.findOne({ profile_id: user.id });
    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member of a team.' }, { status: 400 });
    }

    // Find team by code
    const team = await Team.findOne({ code: code.trim().toUpperCase() });
    if (!team) {
      return NextResponse.json({ error: 'Invalid invite code. Team not found.' }, { status: 404 });
    }

    // Check capacity
    const membersCount = await TeamMember.countDocuments({ team_id: team._id });
    if (membersCount >= team.max_members) {
      return NextResponse.json({ error: 'Team is already full (maximum 4 members).' }, { status: 400 });
    }

    // Join team
    const newMember = await TeamMember.create({
      team_id: team._id,
      profile_id: user.id,
    });

    return NextResponse.json({ success: true, team, member: newMember });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Leave, delete, or remove a member from a team
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // leave, delete, or remove
    const memberId = searchParams.get('memberId'); // required for 'remove'

    await dbConnect();

    // Find user's membership
    const memberRecord = await TeamMember.findOne({ profile_id: user.id });
    if (!memberRecord) {
      return NextResponse.json({ error: 'You do not belong to any team.' }, { status: 400 });
    }

    const team = await Team.findById(memberRecord.team_id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    if (action === 'delete') {
      // Must be captain
      if (team.captain_id !== user.id) {
        return NextResponse.json({ error: 'Only the captain can delete the team.' }, { status: 403 });
      }

      // Delete all team memberships
      await TeamMember.deleteMany({ team_id: team._id });
      // Delete team
      await Team.findByIdAndDelete(team._id);

      return NextResponse.json({ success: true, message: 'Team deleted.' });
    }

    if (action === 'leave') {
      // Captain cannot leave directly; they must delete the team or transfer captaincy
      if (team.captain_id === user.id) {
        return NextResponse.json({ error: 'Captains cannot leave. Please delete the team instead.' }, { status: 400 });
      }

      await TeamMember.deleteOne({ profile_id: user.id });
      return NextResponse.json({ success: true, message: 'Left team.' });
    }

    if (action === 'remove') {
      if (!memberId) {
        return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });
      }

      // Must be captain
      if (team.captain_id !== user.id) {
        return NextResponse.json({ error: 'Only the captain can remove team members.' }, { status: 403 });
      }

      if (memberId === user.id) {
        return NextResponse.json({ error: 'You cannot remove yourself. Please delete the team instead.' }, { status: 400 });
      }

      await TeamMember.deleteOne({ profile_id: memberId, team_id: team._id });
      return NextResponse.json({ success: true, message: 'Member removed.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
