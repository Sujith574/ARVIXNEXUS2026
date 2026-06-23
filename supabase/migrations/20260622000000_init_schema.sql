-- Create role enum type
CREATE TYPE user_role AS ENUM ('participant', 'judge', 'mentor', 'admin', 'super_admin');

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'participant',
    phone TEXT,
    github TEXT,
    linkedin TEXT,
    skills TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    captain_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    code CHAR(6) UNIQUE NOT NULL,
    max_members INT DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Team Members table
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Problem Statements table
CREATE TABLE IF NOT EXISTS public.problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    pdf_url TEXT,
    api_links JSONB DEFAULT '[]'::jsonb,
    track TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 5. Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    demo_video_url TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Scores table
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    criteria_scores JSONB NOT NULL, -- { innovation: X, impact: X, technical: X, presentation: X }
    comment TEXT,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (submission_id, judge_id)
);

-- 7. Event Agenda table
CREATE TABLE IF NOT EXISTS public.event_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    speaker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('session', 'break', 'keynote'))
);

-- 8. Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    invitee_name TEXT NOT NULL,
    email TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('VIP', 'press', 'public')),
    max_uses INT DEFAULT 1,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 9. RSVPs table
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    confirmed BOOLEAN DEFAULT true,
    qr_code_data TEXT NOT NULL UNIQUE,
    checkin_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. VIP Documents table
CREATE TABLE IF NOT EXISTS public.vip_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    visible_to_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 11. Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('participation', 'winner')),
    pdf_url TEXT NOT NULL,
    sent_at TIMESTAMPTZ
);

-- Sync auth users to profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
        new.email,
        'participant',
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to log audit actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_details JSONB,
    p_ip_address TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (admin_id, action, details, ip_address)
    VALUES (p_admin_id, p_action, p_details, p_ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--------------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- RLS POLICIES
--------------------------------------------------------------------------------

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything to profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Teams Policies
CREATE POLICY "Teams are viewable by authenticated users" ON public.teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create a team" ON public.teams
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team captains can update their team" ON public.teams
    FOR UPDATE USING (captain_id = auth.uid());

CREATE POLICY "Admins can do everything to teams" ON public.teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Team Members Policies
CREATE POLICY "Team members are viewable by team participants and admins" ON public.team_members
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can join a team" ON public.team_members
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can leave a team or captains can remove members" ON public.team_members
    FOR DELETE USING (
        auth.uid() = profile_id OR
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE teams.id = team_members.team_id AND teams.captain_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Problem Statements Policies
CREATE POLICY "Active problem statements are viewable by public" ON public.problem_statements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage problem statements" ON public.problem_statements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Submissions Policies
CREATE POLICY "Submissions viewable by team members, judges, and admins" ON public.submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = submissions.team_id AND team_members.profile_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('judge', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Team captains can create submissions" ON public.submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE teams.id = submissions.team_id AND teams.captain_id = auth.uid()
        )
    );

CREATE POLICY "Team captains can update submissions before locking" ON public.submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE teams.id = submissions.team_id AND teams.captain_id = auth.uid()
        ) AND status = 'draft'
    );

CREATE POLICY "Admins can manage submissions" ON public.submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Scores Policies
CREATE POLICY "Scores viewable by judges and admins" ON public.scores
    FOR SELECT USING (
        judge_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Judges can insert own scores" ON public.scores
    FOR INSERT WITH CHECK (
        judge_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'judge'
        )
    );

CREATE POLICY "Judges can update own scores if not final" ON public.scores
    FOR UPDATE USING (
        judge_id = auth.uid() AND is_final = false
    );

CREATE POLICY "Admins can manage all scores" ON public.scores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Event Agenda Policies
CREATE POLICY "Event agenda is public" ON public.event_agenda
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage event agenda" ON public.event_agenda
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Invitations Policies
CREATE POLICY "Admins can view and manage invitations" ON public.invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Public validation of codes" ON public.invitations
    FOR SELECT USING (is_active = true);

-- RSVPs Policies
CREATE POLICY "Users can view their own RSVPs" ON public.rsvps
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "RSVP creation from public invitation form" ON public.rsvps
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage RSVPs" ON public.rsvps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- VIP Documents Policies
CREATE POLICY "VIPs can view documents assigned to them" ON public.vip_documents
    FOR SELECT USING (
        visible_to_profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage VIP documents" ON public.vip_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Audit Logs Policies
CREATE POLICY "Only admins and super_admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Certificates Policies
CREATE POLICY "Recipients can view their certificates" ON public.certificates
    FOR SELECT USING (
        profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System/Admins can manage certificates" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );
