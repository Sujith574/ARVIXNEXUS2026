# National Launch & Hybrid Hackathon Platform

A comprehensive full-stack Next.js 16 + Supabase + Tailwind web platform for organizing a hybrid (physical + virtual) hackathon and a central government launch event with VIP guests.

## Features Built

1. **Authentication & Role-Based Access Control**:
   - Secure login and signup via Supabase.
   - Dynamic user routing and middleware-level dashboard lockouts (re-routing non-admins from `/admin`, non-judges from `/judge`, and non-authorized guests from `/event/vip`).
   - Profile management console at `/profile` for setting up developer credentials and technical skill tags.
2. **Hackathon Workspace**:
   - Curated problem statement directory at `/hackathon/problems` with track sorting and code links.
   - Team workspaces at `/hackathon/teams` to create unique 6-character invitation code teams or join existing ones.
   - Project Submissions form at `/hackathon/submit` supporting file uploads to private buckets and draft/final locked checkouts.
   - Real-time in-memory chat workspace for mentors and teams at `/hackathon/mentor-chat` using Supabase Broadcast.
   - Real-time Leaderboard displaying average marks from judges at `/hackathon/leaderboard`.
3. **VIP & Press Launch Services**:
   - Event Home at `/` with active countdown timer, interactive agenda, and live broadcast embed.
   - Verification RSVPs at `/event/rsvp` generating downloadable ticket credentials with secure QR codes.
   - Terminal Gate Check-in page at `/event/checkin` integrating device camera scans and manual ticket overrides.
   - Secure VIP lounge at `/event/vip` displaying private briefing papers and receiving live stage cues.
   - Media Kit and downloads room at `/event/press`.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, `qrcode.react`, `html5-qrcode`.
- **Backend/DB**: Supabase (PostgreSQL, Row-Level Security policies, Storage Buckets).
- **Email/Edge**: Resend API, Deno Edge Functions.

---

## Setup & Local Development

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory and specify your API credentials (refer to `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
```

### 2. Set Up Database Schema
Apply the database migrations found under the `supabase/migrations/` directory in your Supabase SQL Editor:
1. Run `20260622000000_init_schema.sql` to initialize all 12 normalized tables, RLS policies, audit hooks, and auth syncing triggers.
2. Run `20260622000001_storage_buckets.sql` to define storage rules and permissions.
3. Run `20260622000002_leaderboard_view.sql` to generate the aggregate leaderboard view.
4. Run `20260622000003_seed_invitations.sql` to pre-seed test RSVPs and problems.

### 3. Seed Admin / VIP / Judge Accounts
To test the restricted access portals, sign up an account via the `/signup` screen, then edit the user's role in the Supabase database:
```sql
-- Promote a user to Admin console
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Promote a user to Judge scorecard access
UPDATE public.profiles SET role = 'judge' WHERE email = 'judge-email@example.com';
```

For VIP RSVPs and scan check-ins, use the following pre-seeded invitation codes at `/event/rsvp`:
- **`VIP777`** - VIP Access Tier
- **`PRESS888`** - Press Access Tier
- **`GUEST999`** - General Public Tier

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
