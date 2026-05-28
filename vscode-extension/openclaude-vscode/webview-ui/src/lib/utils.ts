import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind classes with clsx and tailwind-merge
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
