import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function formatDurationForToast(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h} hora${h !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} segundo${s !== 1 ? 's' : ''}`);

  return parts.join(', ');
}
