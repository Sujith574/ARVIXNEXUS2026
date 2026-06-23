import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';
import Score from '@/models/Score';
import Team from '@/models/Team';
import Profile from '@/models/Profile';

// GET: Retrieve evaluation submissions or a single submission details
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify judge permissions
    const profile = await Profile.findById(user.id);
    if (!profile || (profile.role !== 'judge' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (submissionId) {
      // Fetch details of a single submission
      const sub = await Submission.findById(submissionId).populate('team_id');
      if (!sub) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      // Fetch score by this judge
      const score = await Score.findOne({ submission_id: sub._id, judge_id: user.id });

      const teamDoc = sub.team_id as any;
      const formattedSub = {
        ...sub.toObject(),
        id: sub._id.toString(),
        teams: teamDoc ? { name: teamDoc.name } : null,
      };

      return NextResponse.json({ submission: formattedSub, score });
    } else {
      // Fetch all submissions with status 'submitted'
      const subs = await Submission.find({ status: 'submitted' }).populate('team_id');
      const scoresList = await Score.find({ judge_id: user.id });

      const formattedSubs = subs.map((sub) => {
        const teamDoc = sub.team_id as any;
        return {
          ...sub.toObject(),
          id: sub._id.toString(),
          teams: teamDoc ? { name: teamDoc.name } : null,
        };
      });

      return NextResponse.json({ submissions: formattedSubs, scores: scoresList });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Save or Finalize score card
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify judge permissions
    const profile = await Profile.findById(user.id);
    if (!profile || (profile.role !== 'judge' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { submission_id, criteria_scores, comment, is_final } = body;

    if (!submission_id || !criteria_scores) {
      return NextResponse.json({ error: 'Submission ID and criteria scores are required' }, { status: 400 });
    }

    // Verify scorecard is not already locked
    const existingScore = await Score.findOne({ submission_id, judge_id: user.id });
    if (existingScore && existingScore.is_final) {
      return NextResponse.json({ error: 'This scorecard is already locked and cannot be updated.' }, { status: 403 });
    }

    let result;
    if (existingScore) {
      existingScore.criteria_scores = criteria_scores;
      existingScore.comment = comment || '';
      existingScore.is_final = !!is_final;
      result = await existingScore.save();
    } else {
      result = await Score.create({
        submission_id,
        judge_id: user.id,
        criteria_scores,
        comment: comment || '',
        is_final: !!is_final,
      });
    }

    return NextResponse.json({ success: true, score: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
