/**
 * Fehler einordnen – genau die drei Fälle aus der Axios-Doku (Folie 6):
 *
 *   error.response  → Server hat geantwortet, Status außerhalb 2xx (404, 422, 500 …)
 *   error.request   → Request ging raus, aber keine Antwort (Netzwerk, Timeout)
 *   sonst           → Fehler schon beim Aufbau des Requests (ungültige Config)
 *
 * Zusätzlich: bewusst abgebrochene Requests (AbortController) sind kein echter
 * Fehler und werden separat erkannt.
 */
import axios from 'axios'
import type { ApiErrorBody } from '@/types/user'

export type ErrorKind = 'response' | 'timeout' | 'network' | 'canceled' | 'setup' | 'unknown'

export interface ErrorInfo {
  kind: ErrorKind
  /** Welcher Zweig der Axios-Fehlerbehandlung gegriffen hat (für die Anzeige) */
  branch: 'error.response' | 'error.request' | 'axios.isCancel' | 'sonst'
  /** HTTP-Status, nur wenn der Server geantwortet hat */
  status?: number
  /** Axios-Fehlercode, z. B. ERR_BAD_REQUEST, ECONNABORTED, ERR_NETWORK */
  code?: string
  message: string
}

export function describeError(error: unknown): ErrorInfo {
  // 1) Gewollter Abbruch über AbortController → kein Fehler im eigentlichen Sinn
  if (axios.isCancel(error)) {
    return { kind: 'canceled', branch: 'axios.isCancel', code: 'ERR_CANCELED', message: 'Request abgebrochen' }
  }

  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return { kind: 'unknown', branch: 'sonst', message: error instanceof Error ? error.message : String(error) }
  }

  // 2) Server hat geantwortet, aber mit Status außerhalb 2xx
  if (error.response) {
    return {
      kind: 'response',
      branch: 'error.response',
      status: error.response.status,
      code: error.code,
      // Bevorzugt die Meldung aus dem JSON-Body des Backends
      message: error.response.data?.message ?? error.message,
    }
  }

  // 3) Request wurde gesendet, aber keine Antwort kam an
  if (error.request) {
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
    return {
      kind: isTimeout ? 'timeout' : 'network',
      branch: 'error.request',
      code: error.code,
      message: isTimeout ? 'Zeitüberschreitung: keine Antwort innerhalb des Timeouts' : 'Netzwerkfehler: Server nicht erreichbar',
    }
  }

  // 4) Fehler beim Aufbau des Requests – er wurde nie gesendet
  return { kind: 'setup', branch: 'sonst', code: error.code, message: error.message }
}
