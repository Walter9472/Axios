/**
 * Ordnet ein Ergebnis einer Farbklasse zu (siehe .status--* in main.css).
 * Wird von Protokoll, Fehlerszenarien und Vergleichsansicht gemeinsam genutzt.
 */
import type { LogOutcome } from '@/services/requestLog'

export type StatusTone = 'success' | 'client' | 'server' | 'nores' | 'canceled' | 'pending'

export function statusTone(outcome: LogOutcome, status?: number): StatusTone {
  if (outcome === 'pending') return 'pending'
  if (outcome === 'canceled') return 'canceled'
  if (status !== undefined) {
    if (status >= 500) return 'server'
    if (status >= 400) return 'client'
    return 'success'
  }
  return outcome === 'success' ? 'success' : 'nores'
}

/** Kurzer Text im Badge: Statuscode oder Art des Fehlers */
export function statusLabel(outcome: LogOutcome, status?: number): string {
  if (status !== undefined) return String(status)
  switch (outcome) {
    case 'pending':
      return '…'
    case 'canceled':
      return 'abgebr.'
    case 'timeout':
      return 'Timeout'
    case 'network':
      return 'Netz'
    default:
      return '–'
  }
}
