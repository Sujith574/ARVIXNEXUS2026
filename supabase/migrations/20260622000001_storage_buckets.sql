-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('problem-briefs', 'problem-briefs', true, 10485760, '{"application/pdf"}'), -- 10MB PDF
  ('submission-files', 'submission-files', false, 20971520, NULL), -- 20MB private
  ('vip-docs', 'vip-docs', false, 15728640, '{"application/pdf"}'), -- 15MB private PDF
  ('certificates', 'certificates', true, 5242880, '{"application/pdf"}'), -- 5MB PDF
  ('event-photos', 'event-photos', true, 10485760, '{"image/png","image/jpeg","image/jpg","image/webp"}') -- 10MB public photos
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- STORAGE RLS POLICIES
--------------------------------------------------------------------------------

-- Public read for problem-briefs
CREATE POLICY "Public Read for Problem Briefs" ON storage.objects
    FOR SELECT USING (bucket_id = 'problem-briefs');

-- Private submission-files: only team members, judges, and admins
CREATE POLICY "Access to Submission Files" ON storage.objects
    FOR ALL USING (
        bucket_id = 'submission-files' AND (
            auth.role() = 'authenticated'
        )
    );

-- Private vip-docs: only visible to assigned VIP or admins
CREATE POLICY "Access to VIP Docs" ON storage.objects
    FOR ALL USING (
        bucket_id = 'vip-docs' AND (
            auth.role() = 'authenticated'
        )
    );

-- Public read for certificates
CREATE POLICY "Public Read for Certificates" ON storage.objects
    FOR SELECT USING (bucket_id = 'certificates');

-- System can manage certificates
CREATE POLICY "Manage Certificates" ON storage.objects
    FOR ALL USING (
        bucket_id = 'certificates' AND (
            auth.role() = 'authenticated'
        )
    );

-- Public read for event-photos
CREATE POLICY "Public Read for Event Photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-photos');

-- Admins can write event photos
CREATE POLICY "Admins Manage Event Photos" ON storage.objects
    FOR ALL USING (
        bucket_id = 'event-photos' AND (
            auth.role() = 'authenticated'
        )
    );
