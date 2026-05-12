import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date string to PKT (Lahore) timezone display */
export function formatPKT(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/** Get today's date in YYYY-MM-DD format (PKT) */
export function todayPKT(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
}

/** Convert PKT date + time to UTC ISO string */
export function pktToUtcIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00+05:00`).toISOString()
}
