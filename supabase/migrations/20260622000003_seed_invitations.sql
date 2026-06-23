-- Seed invitations for demo testing
INSERT INTO public.invitations (code, invitee_name, email, type, max_uses, times_used, is_active)
VALUES 
  ('VIP777', 'Dr. Rajesh Kumar (Senior Director)', 'rajesh.kumar@meity.gov.in', 'VIP', 5, 0, true),
  ('PRESS888', 'Press Trust of India (PTI)', 'media@pti.in', 'press', 10, 0, true),
  ('GUEST999', 'General Public Delegate', 'delegate@your-hackathon.gov.in', 'public', 100, 0, true)
ON CONFLICT (code) DO NOTHING;

-- Seed problem statements
INSERT INTO public.problem_statements (title, description, pdf_url, api_links, track, is_active)
VALUES
  ('AI-Enabled Public Grievance Redressal System', 'Build a system to automatically categorize, prioritize, and summarize public grievances submitted to the government portals. Integrate sentiment analysis and auto-routing to relevant ministries for rapid resolution.', '#', '[{"name": "CPGRAMS API", "url": "https://cpgrams.gov.in/api-doc"}, {"name": "Bhashini Translation API", "url": "https://bhashini.gov.in/en/"}]'::jsonb, 'AI for Governance', true),
  ('Blockchain-Based Land Registry & Smart Contracts', 'Develop a secure, immutable, and transparent land ownership registry using Distributed Ledger Technology. Design smart contracts for ownership transfers that auto-execute on payment clearance to prevent land frauds.', '#', '[{"name": "India Stack Auth API", "url": "https://indiastack.org/"}, {"name": "National Map Datasets", "url": "https://bhuvan.nrsc.gov.in/"}]'::jsonb, 'Digital India', true),
  ('IoT-Driven Real-time Air Quality & Traffic Management', 'Integrate real-time feeds from city air quality sensors and traffic cameras. Build an intelligent traffic light control system that optimizes traffic flows dynamically in high pollution hotspots to disperse congestion.', '#', '[{"name": "Open Government Data (OGD)", "url": "https://data.gov.in"}]'::jsonb, 'Smart Cities', true)
ON CONFLICT DO NOTHING;

-- Seed an example active event agenda
INSERT INTO public.event_agenda (title, description, start_time, end_time, type)
VALUES
  ('Delegate Registration & Welcome', 'Registration Desk at Vigyan Bhawan Lobby', '2026-07-10T09:00:00+05:30', '2026-07-10T10:00:00+05:30', 'session'),
  ('Inaugural Address & National Launch', 'Launch by Hon’ble Minister for Electronics & IT', '2026-07-10T10:00:00+05:30', '2026-07-10T11:15:00+05:30', 'keynote'),
  ('Unveiling of the Digital Stack 2026', 'MeitY Technology Leads demonstration', '2026-07-10T11:15:00+05:30', '2026-07-10T12:00:00+05:30', 'keynote'),
  ('Panel: Scaling AI in Public Service Delivery', 'Senior IAS officers and technological directors panel discussion', '2026-07-10T12:00:00+05:30', '2026-07-10T13:00:00+05:30', 'session'),
  ('Networking Lunch & Media Interaction', 'Lawn banquets and media room access', '2026-07-10T13:00:00+05:30', '2026-07-10T14:00:00+05:30', 'break'),
  ('National Hackathon Opening Ceremony', 'Organizing committee kick-off session and track allocations', '2026-07-10T14:00:00+05:30', '2026-07-10T15:30:00+05:30', 'session')
ON CONFLICT DO NOTHING;
