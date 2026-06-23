import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongodb';
import VipDocument from '@/models/VipDocument';
import Profile from '@/models/Profile';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Fetch user profile
    const profile = await Profile.findById(user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch secure VIP documents visible to this user
    const docs = await VipDocument.find({ visible_to_profile_id: user.id });
    const formattedDocs = docs.map((doc) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
    }));

    return NextResponse.json({ profile, documents: formattedDocs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
