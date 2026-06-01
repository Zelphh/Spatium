-- ============================================================
--  Add soft-delete column to core entities
-- ============================================================

ALTER TABLE timer_session ADD COLUMN deleted_at TEXT;
ALTER TABLE category ADD COLUMN deleted_at TEXT;
ALTER TABLE shortcut_key ADD COLUMN deleted_at TEXT;
