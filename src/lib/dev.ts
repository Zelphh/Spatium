import { invoke } from "@tauri-apps/api/core";

export function seedSampleData() {
  return invoke<string>("seed_sample_data");
}

export function clearSampleData() {
  return invoke<string>("clear_sample_data");
}
