-- Add category_color to vw_history_sessions
DROP VIEW IF EXISTS vw_history_sessions;

CREATE VIEW vw_history_sessions AS
SELECT
    ts.id,
    ts.user_id,
    COALESCE(c.name,  'Sem categoria') AS category_name,
    COALESCE(c.color, '#6b7280')       AS category_color,
    ts.mode,
    COALESCE(ts.description, '-')      AS description,
    ts.duration_secs,
    ts.created_at
FROM timer_session ts
LEFT JOIN category c ON c.id = ts.category_id;
