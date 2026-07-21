-- ============================================================
--  KEYBOARD SHORTCUTS — avoid common global-hotkey collisions
--  ('CommandOrControl+Shift+I' is already claimed by several
--  third-party apps as a global inspect/overlay shortcut)
-- ============================================================
UPDATE action SET default_key = 'CommandOrControl+Alt+Shift+I' WHERE action = 'open_quick_start';
UPDATE action SET default_key = 'CommandOrControl+Alt+Shift+T' WHERE action = 'start_timer_now';

-- Limpa overrides de usuário anteriores para que os novos defaults valham imediatamente.
UPDATE shortcut_key
SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE deleted_at IS NULL;
