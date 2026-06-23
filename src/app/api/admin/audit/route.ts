import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
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

    // Ensure Profile is registered for lookup populate
    const _dummyProfile = Profile.modelName;

    // Fetch all audit logs ordered by date
    const logs = await AuditLog.find()
      .populate('admin_id')
      .sort({ createdAt: -1 });

    const formattedLogs = logs.map((log) => {
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

    return NextResponse.json({ logs: formattedLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
