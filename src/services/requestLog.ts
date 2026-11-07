/**
 * Request-Protokoll für die Demo-Oberfläche.
 *
 * Auch das ist „nur“ ein Paar Interceptors: Der Request-Interceptor merkt sich
 * Startzeit und Header, der Response-Interceptor trägt Status und Dauer nach.
 * So sieht man live, dass jeder Request durch die Interceptor-Kette läuft –
 * ohne dass eine Komponente dafür Code schreiben muss.
 */
import { reactive } from 'vue'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { describeError, type ErrorKind } from './errors'

// Eigenes Feld an der Request-Config, um Request und Response zuzuordnen
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    meta?: { logId: number; startedAt: number }
  }
}

export type LogOutcome = 'pending' | 'success' | ErrorKind

export interface LogEntry {
  id: number
  method: string
  url: string
  authorization: string | null
  outcome: LogOutcome
  status?: number
  code?: string
  durationMs?: number
}

const MAX_ENTRIES = 30

export const requestLog = reactive<LogEntry[]>([])

let nextId = 1

export function clearRequestLog(): void {
  requestLog.splice(0, requestLog.length)
}

function finish(config: InternalAxiosRequestConfig | undefined, patch: Partial<LogEntry>): void {
  if (!config?.meta) return
  const entry = requestLog.find((e) => e.id === config.meta!.logId)
  if (!entry) return
  Object.assign(entry, patch, { durationMs: Math.round(performance.now() - config.meta.startedAt) })
}

export function installRequestLogger(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const id = nextId++
    config.meta = { logId: id, startedAt: performance.now() }
    requestLog.unshift({
      id,
      method: (config.method ?? 'get').toUpperCase(),
      url: instance.getUri(config),
      authorization: config.headers.Authorization ? String(config.headers.Authorization) : null,
      outcome: 'pending',
    })
    if (requestLog.length > MAX_ENTRIES) requestLog.length = MAX_ENTRIES
    return config
  })

  instance.interceptors.response.use(
    (response) => {
      finish(response.config, { outcome: 'success', status: response.status })
      return response
    },
    (error) => {
      const info = describeError(error)
      finish(error?.config, { outcome: info.kind, status: info.status, code: info.code })
      return Promise.reject(error)
    },
  )
}
