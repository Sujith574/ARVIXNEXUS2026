import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import ProblemStatement from '@/models/ProblemStatement';
import Submission from '@/models/Submission';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';

// GET: Fetch administrative data for the hackathon
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

    // Ensure models are registered
    const _dummyTeam = Team.modelName;

    // Fetch problem statements sorted by track
    const problems = await ProblemStatement.find().sort({ track: 1 });
    const formattedProblems = problems.map((p) => ({
      ...p.toObject(),
      id: p._id.toString(),
    }));

    // Fetch submissions populated with team name
    const subs = await Submission.find().populate('team_id');
    const formattedSubs = subs.map((sub) => {
      const teamDoc = sub.team_id as any;
      return {
        ...sub.toObject(),
        id: sub._id.toString(),
        teams: teamDoc ? { name: teamDoc.name } : null,
      };
    });

    // Fetch judges profiles
    const judges = await Profile.find({ role: 'judge' }).sort({ full_name: 1 });
    const formattedJudges = judges.map((j) => ({
      ...j.toObject(),
      id: j._id.toString(),
    }));

    return NextResponse.json({
      problems: formattedProblems,
      submissions: formattedSubs,
      judges: formattedJudges,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Manage problem statements
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

    if (action === 'createProblem') {
      const { title, description, track, api_links } = body;
      if (!title || !description || !track) {
        return NextResponse.json({ error: 'Missing challenge details' }, { status: 400 });
      }

      const problem = await ProblemStatement.create({
        title,
        description,
        track,
        api_links: api_links || [],
        is_active: true,
      });

      await AuditLog.create({
        admin_id: user.id,
        action: 'PROBLEM_STATEMENT_CREATION',
        details: { title, track, problem_id: problem._id },
      });

      return NextResponse.json({ success: true, problem });
    }

    if (action === 'toggleActive') {
      const { id, currentStatus } = body;
      if (!id) {
        return NextResponse.json({ error: 'Missing problem ID' }, { status: 400 });
      }

      const problem = await ProblemStatement.findByIdAndUpdate(
        id,
        { is_active: !currentStatus },
        { new: true }
      );

      if (!problem) {
        return NextResponse.json({ error: 'Problem statement not found' }, { status: 404 });
      }

      await AuditLog.create({
        admin_id: user.id,
        action: 'PROBLEM_STATEMENT_TOGGLE_ACTIVE',
        details: { problem_id: id, new_status: !currentStatus, title: problem.title },
      });

      return NextResponse.json({ success: true, problem });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
