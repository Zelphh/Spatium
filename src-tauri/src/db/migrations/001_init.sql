-- ============================================================
--  Spatium — Time Management App
--  Database Schema (SQLite)
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
--  USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS user (
    id          INTEGER         PRIMARY KEY AUTOINCREMENT,
    name        TEXT            NOT NULL,
    -- email    TEXT            UNIQUE NOT NULL,
    -- password TEXT            NOT NULL,
    created_at  TEXT            NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
--  SETTINGS  (1-to-1 with users)
--  app_theme:        'light' | 'dark'
--  app_accent_color: 'violet' | 'cyan' | 'pink' | 'amber' | 'emerald' | 'blue'
-- ============================================================
CREATE TABLE IF NOT EXISTS user_setting (
    id            INTEGER    PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER    NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
    theme         TEXT       NOT NULL DEFAULT 'dark'   CHECK(theme IN ('light', 'dark')),
    accent_color  TEXT       NOT NULL DEFAULT 'violet' CHECK(accent_color IN ('violet', 'cyan', 'pink', 'amber', 'emerald', 'blue')),
    updated_at    TEXT       NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
--  CATEGORIES  (built-in + user-created)
-- ============================================================
CREATE TABLE IF NOT EXISTS category (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,
    color       TEXT    NOT NULL DEFAULT '#8B5CF6',  -- hex color
    icon        TEXT,                                 -- optional icon identifier
    is_default  INTEGER NOT NULL DEFAULT 0,           -- 1 for Work/Study/Games seed rows
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (user_id, name)
);

-- ============================================================
--  TIMER SESSIONS  (every completed or saved timer run)
--  mode:  'standard' | 'pomodoro' | 'custom'
-- ============================================================
CREATE TABLE IF NOT EXISTS timer_session (
    id              INTEGER   PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER   NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    category_id     INTEGER   REFERENCES category(id) ON DELETE SET NULL,
    mode            TEXT      NOT NULL DEFAULT 'standard' CHECK(mode IN ('standard', 'pomodoro', 'custom')),
    duration_secs   INTEGER   NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TEXT      NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
--  TIMER SESSION EVENTS
--  event: 'started' | 'finished' | 'paused' | 'unpaused'
-- ============================================================
CREATE TABLE IF NOT EXISTS timer_session_event (
    id          INTEGER PRIMARY KEY, 
    session_id  INTEGER REFERENCES timer_session(id) ON DELETE SET NULL,
    event       TEXT    NOT NULL DEFAULT 'started' CHECK(event IN ('started', 'finished', 'paused', 'unpaused')),
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
--  POMODORO CONFIG
-- ============================================================
CREATE TABLE IF NOT EXISTS pomodoro_config (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    focus_duration_mins INTEGER NOT NULL DEFAULT 25,
    short_break_mins    INTEGER NOT NULL DEFAULT 5,
    long_break_mins     INTEGER NOT NULL DEFAULT 15,
    cycles_before_long  INTEGER NOT NULL DEFAULT 4,
    is_active           INTEGER NOT NULL DEFAULT 1,  -- 1 = active config
    updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
--  KEYBOARD SHORTCUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS action (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    action_label  TEXT    NOT NULL,
    action        TEXT    NOT NULL,
    default_key   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS shortcut_key (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    action_id   INTEGER NOT NULL REFERENCES action(id) ON DELETE RESTRICT,
    keys        TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX idx_timer_session_user_id      ON timer_session(user_id);
CREATE INDEX idx_timer_session_category_id  ON timer_session(category_id);
CREATE INDEX idx_category_user_id           ON category(user_id);

-- ============================================================
--  VIEWS
-- ============================================================

-- Daily summary per user
CREATE VIEW IF NOT EXISTS vw_daily_summary AS
SELECT
    user_id,
    date(created_at)            AS day,
    COUNT(*)                    AS session_count,
    SUM(duration_secs)          AS total_secs,
    ROUND(SUM(duration_secs) / 3600.0, 2) AS total_hours
FROM timer_session
GROUP BY user_id, date(created_at);

-- Weekly summary per user (week starts on Monday)
CREATE VIEW IF NOT EXISTS vw_weekly_summary AS
SELECT
    user_id,
    date(created_at, 'weekday 1', '-7 days') AS week_start,
    COUNT(*)                                  AS session_count,
    SUM(duration_secs)                        AS total_secs,
    ROUND(SUM(duration_secs) / 3600.0, 2)    AS total_hours
FROM timer_session
GROUP BY user_id, date(created_at, 'weekday 1', '-7 days');

-- Per-category breakdown (feeds the Statistics screen)
CREATE VIEW IF NOT EXISTS vw_category_stats AS
SELECT
    ts.user_id,
    c.name                                        AS category_name,
    c.color                                       AS category_color,
    COUNT(ts.id)                                  AS session_count,
    SUM(ts.duration_secs)                         AS total_secs,
    ROUND(SUM(ts.duration_secs) / 3600.0, 2)     AS total_hours
FROM timer_session ts
LEFT JOIN category c ON c.id = ts.category_id
GROUP BY ts.user_id, c.name, c.color;
