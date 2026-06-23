import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';
import Submission from '@/models/Submission';

const SUBMISSION_DEADLINE = new Date('2026-07-31T23:59:59Z');

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
      return NextResponse.json({ submission: null });
    }

    // Find submission for this team
    const submission = await Submission.findOne({ team_id: memberRecord.team_id });
    const formattedSub = submission ? {
      ...submission.toObject(),
      id: submission._id.toString(),
    } : null;

    return NextResponse.json({ submission: formattedSub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user via Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Enforce deadline
    const now = new Date();
    if (now > SUBMISSION_DEADLINE) {
      return NextResponse.json(
        { error: 'The project submission deadline has passed (July 31, 2026).' },
        { status: 403 }
      );
    }

    await dbConnect();

    // 3. Find user's team membership in MongoDB
    const memberRecord = await TeamMember.findOne({ profile_id: user.id });

    if (!memberRecord) {
      return NextResponse.json({ error: 'You must belong to a team to submit a project.' }, { status: 400 });
    }

    // Fetch team
    const team = await Team.findById(memberRecord.team_id);

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    // Verify captain status
    if (team.captain_id !== user.id) {
      return NextResponse.json({ error: 'Only the team captain is authorized to submit or edit projects.' }, { status: 403 });
    }

    // 4. Read body
    const body = await request.json();
    const { title, description, repo_url, live_url, demo_video_url, screenshots, document_url, isFinalSubmit } = body;

    if (!title || !description || !repo_url || !live_url) {
      return NextResponse.json({ error: 'Title, description, repository URL, and live link are required.' }, { status: 400 });
    }

    // 5. Check if already submitted & locked
    const existingSubmission = await Submission.findOne({ team_id: team._id });

    if (existingSubmission && existingSubmission.status === 'submitted') {
      return NextResponse.json(
        { error: 'This project has already been submitted and the status is locked.' },
        { status: 403 }
      );
    }

    const newStatus = isFinalSubmit ? 'submitted' : 'draft';

    // 6. Upsert Submission
    let submissionResult;
    if (existingSubmission) {
      existingSubmission.title = title;
      existingSubmission.description = description;
      existingSubmission.repo_url = repo_url;
      existingSubmission.live_url = live_url;
      existingSubmission.demo_video_url = demo_video_url || null;
      existingSubmission.screenshots = screenshots || [];
      existingSubmission.document_url = document_url || null;
      existingSubmission.status = newStatus;
      existingSubmission.submittedAt = now;
      
      submissionResult = await existingSubmission.save();
    } else {
      submissionResult = await Submission.create({
        team_id: team._id,
        title,
        description,
        repo_url,
        live_url,
        demo_video_url: demo_video_url || null,
        screenshots: screenshots || [],
        document_url: document_url || null,
        status: newStatus,
        submittedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: isFinalSubmit ? 'Project final submission locked!' : 'Draft saved successfully.',
      submission: submissionResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
