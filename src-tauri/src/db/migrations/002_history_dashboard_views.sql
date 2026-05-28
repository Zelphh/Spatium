CREATE VIEW IF NOT EXISTS vw_history_sessions AS
SELECT
    ts.id,
    ts.user_id,
    COALESCE(c.name, 'Sem categoria') AS category_name,
    ts.duration_secs,
    ts.created_at
FROM timer_session ts
LEFT JOIN category c ON c.id = ts.category_id;
