import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Team from '@/models/Team';
import Submission from '@/models/Submission';
import Rsvp from '@/models/Rsvp';
import AuditLog from '@/models/AuditLog';

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

    // Run counts concurrently
    const [users, teams, submissions, rsvps, checkins] = await Promise.all([
      Profile.countDocuments(),
      Team.countDocuments(),
      Submission.countDocuments(),
      Rsvp.countDocuments(),
      Rsvp.countDocuments({ checkin_time: { $ne: null } }),
    ]);

    // Fetch recent audit logs populated with operator profile
    const recentAudits = await AuditLog.find()
      .populate('admin_id')
      .sort({ createdAt: -1 })
      .limit(6);

    const formattedAudits = recentAudits.map((log) => {
      const adminDoc = log.admin_id as any;
      return {
        ...log.toObject(),
        id: log._id.toString(),
        profiles: adminDoc ? {
          full_name: adminDoc.full_name,
          role: adminDoc.role,
        } : null,
        created_at: log.createdAt,
      };
    });

    return NextResponse.json({
      stats: {
        users,
        teams,
        submissions,
        rsvps,
        checkins,
      },
      recentAudits: formattedAudits,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
