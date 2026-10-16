import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, suffix?: string): string {
  const root = slugify(base) || "prediction";
  if (!suffix) return root;
  return `${root}-${slugify(suffix)}`.slice(0, 100);
}

export function clampPage(page: number, max = 1000): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), max);
}

export function clampPageSize(size: number, max = 50): number {
  if (!Number.isFinite(size) || size < 1) return 12;
  return Math.min(Math.floor(size), max);
}
