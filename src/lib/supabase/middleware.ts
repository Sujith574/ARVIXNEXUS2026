import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if needed
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Static files and auth endpoints exclusion
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('/favicon.ico')
  ) {
    return response;
  }

  if (user) {
    const role = user.user_metadata?.role || 'participant';

    // Route Protection
    if (path.startsWith('/admin') && role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (path.startsWith('/judge') && role !== 'judge' && role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (path.startsWith('/event/vip') && role !== 'admin' && role !== 'super_admin' && role !== 'participant') {
      // Allow admin/super_admin/vip to view. Wait, VIP role in enum is not defined as VIP but they have vip profiles or invitations. 
      // Let's verify role: wait, the enum from migrations has: 'participant', 'judge', 'mentor', 'admin', 'super_admin'.
      // Wait, let's see. If the VIP logs in, they are assigned a VIP account. What role is that VIP guest?
      // Ah! In our schema, the role is `participant` or `judge` or `mentor` or `admin` or `super_admin`.
      // Wait, is there a VIP role in enum? Let's check the schema.
      // Schema enum: 'participant', 'judge', 'mentor', 'admin', 'super_admin'.
      // If a VIP logs in, they can have a profile, but how do we identify them as VIP?
      // Ah, the VIP dashboard shows a private itinerary, briefing documents, stage cues.
      // The documents in `vip_documents` are filtered by: `visible_to_profile_id = auth.uid()`.
      // So ANY user who has a document visible to them can access `/event/vip`, or they are just regular profiles but flagged.
      // Wait, to be safe, any user who is logged in can visit `/event/vip`, but they will only see documents and itineraries specifically assigned to their `profile_id`. If nothing is assigned to them, it will show a clean "Not assigned" message. That is perfect because it uses PostgreSQL Row Level Security (RLS) to enforce access rather than hardcoding.
      // So let's allow any logged-in user to access `/event/vip`, but limit administrative access.
    }
  } else {
    // Guest blocking
    if (
      path.startsWith('/admin') ||
      path.startsWith('/judge') ||
      path.startsWith('/hackathon/submit') ||
      path.startsWith('/hackathon/mentor-chat') ||
      path.startsWith('/event/vip') ||
      path.startsWith('/profile')
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}
