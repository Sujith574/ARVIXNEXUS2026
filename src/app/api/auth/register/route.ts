import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields: email, password, fullName' }, { status: 400 });
    }

    // 1. Initialize Supabase Admin client using the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Register user in Supabase Auth with auto-confirmed email (highly convenient for dev environments)
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (signUpError || !authData.user) {
      return NextResponse.json({ error: signUpError?.message || 'Failed to create account in Auth.' }, { status: 400 });
    }

    // 3. Connect to MongoDB Atlas
    await dbConnect();

    // 4. Create user profile in MongoDB matching the Auth UUID
    const newProfile = await Profile.create({
      _id: authData.user.id,
      full_name: fullName,
      email,
      role: 'participant',
    });

    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: newProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
