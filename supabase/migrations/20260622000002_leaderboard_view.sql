CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    s.title AS project_title,
    s.repo_url AS repo_url,
    COUNT(sc.id) AS judges_count,
    ROUND(
        AVG(
            COALESCE((sc.criteria_scores->>'innovation')::numeric, 0) +
            COALESCE((sc.criteria_scores->>'impact')::numeric, 0) +
            COALESCE((sc.criteria_scores->>'technical')::numeric, 0) +
            COALESCE((sc.criteria_scores->>'presentation')::numeric, 0)
        ), 2
    ) AS total_score
FROM public.teams t
JOIN public.submissions s ON t.id = s.team_id
LEFT JOIN public.scores sc ON s.id = sc.submission_id AND sc.is_final = true
GROUP BY t.id, t.name, s.title, s.repo_url
ORDER BY total_score DESC NULLS LAST;

-- Enable public select on the view (views inherit RLS from tables, but we grant select)
GRANT SELECT ON public.leaderboard TO anon, authenticated;
