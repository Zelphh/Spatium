import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fundo translúcido derivado da cor de uma categoria (chips e badges). */
export function categoryTint(color: string) {
  return { background: `color-mix(in srgb, ${color} 22%, transparent)` };
}
