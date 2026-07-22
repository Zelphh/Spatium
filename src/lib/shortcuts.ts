import { invoke } from "@tauri-apps/api/core";

export interface ShortcutBinding {
  action_id: number;
  action: string;
  action_label: string;
  keys: string;
}

export interface UpdateShortcutPayload {
  action_id: number;
  keys: string;
}

export function getShortcuts() {
  return invoke<ShortcutBinding[]>("get_shortcuts");
}

export function updateShortcut(payload: UpdateShortcutPayload) {
  return invoke<ShortcutBinding>("update_shortcut", { payload });
}
