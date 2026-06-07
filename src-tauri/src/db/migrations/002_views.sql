-- ============================================================
--  Spatium — Useful Views
-- ============================================================

-- Daily summary per user (all days)
CREATE VIEW IF NOT EXISTS vw_daily_summary AS
SELECT
    user_id,
    date(created_at)                       AS day,
    COUNT(*)                               AS session_count,
    SUM(duration_secs)                     AS total_secs,
    ROUND(SUM(duration_secs) / 3600.0, 2) AS total_hours
FROM timer_session
GROUP BY user_id, date(created_at);

-- Weekly summary per user (current week only, starts on Monday)
CREATE VIEW IF NOT EXISTS vw_weekly_summary AS
SELECT
    user_id,
    date(created_at, 'weekday 1', '-7 days') AS week_start,
    COUNT(*)                                  AS session_count,
    SUM(duration_secs)                        AS total_secs,
    ROUND(SUM(duration_secs) / 3600.0, 2)    AS total_hours
FROM timer_session
WHERE date(created_at, 'weekday 1', '-7 days') = date('now', 'weekday 1', '-7 days')
GROUP BY user_id, date(created_at, 'weekday 1', '-7 days');

-- Monthly summary per user (current month only)
CREATE VIEW IF NOT EXISTS vw_monthly_summary AS
SELECT
    user_id,
    date(created_at, 'start of month')        AS month_start,
    COUNT(*)                                  AS session_count,
    SUM(duration_secs)                        AS total_secs,
    ROUND(SUM(duration_secs) / 3600.0, 2)    AS total_hours
FROM timer_session
WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
GROUP BY user_id, date(created_at, 'start of month');

-- Per-category breakdown (feeds the Statistics screen)
CREATE VIEW IF NOT EXISTS vw_category_stats AS
SELECT
    ts.user_id,
    c.name                                     AS category_name,
    c.color                                    AS category_color,
    COUNT(ts.id)                               AS session_count,
    SUM(ts.duration_secs)                      AS total_secs,
    ROUND(SUM(ts.duration_secs) / 3600.0, 2)  AS total_hours
FROM timer_session ts
LEFT JOIN category c ON c.id = ts.category_id
GROUP BY ts.user_id, c.name, c.color;

-- History session list
CREATE VIEW IF NOT EXISTS vw_history_sessions AS
SELECT
    ts.id,
    ts.user_id,
    COALESCE(c.name, 'Sem categoria') AS category_name,
    ts.mode,
    COALESCE(ts.description, '-')     AS description,
    ts.duration_secs,
    ts.created_at
FROM timer_session ts
LEFT JOIN category c ON c.id = ts.category_id;
