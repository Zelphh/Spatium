import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";

export async function isAutostartEnabled(): Promise<boolean> {
  return isEnabled();
}

export async function enableAutostart(): Promise<void> {
  return enable();
}

export async function disableAutostart(): Promise<void> {
  return disable();
}
