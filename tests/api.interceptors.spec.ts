/**
 * Ebene 1 (Folie 10): Das GANZE Axios-Modul wird gemockt.
 *
 * Achtung, Stolperfalle: Mit einem leeren vi.mock('axios') liefert
 * axios.create() undefined und api.ts stürzt beim Import ab. Deshalb geben
 * wir eine Factory an, die eine Fake-Instanz mit interceptors.use() liefert.
 *
 * Getestet wird:
 *  1. api.ts konfiguriert die Instanz richtig und registriert die Interceptors.
 *  2. Die Interceptor-Funktionen selbst – als ganz normale Funktionen.
 */
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

// vi.hoisted: Variable existiert schon, wenn die (nach oben gehobene) Factory läuft
const fakeInstance = vi.hoisted(() => ({
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  getUri: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => fakeInstance),
    // Unsere Testfehler sind nie Abbrüche
    isCancel: vi.fn(() => false),
    isAxiosError: vi.fn(() => true),
  },
}))

import axios from 'axios'
import { attachAuthToken, handleResponseError } from '@/services/api'
import { useAuthStore } from '@/services/auth'
import { notifications } from '@/services/notifications'

// api.ts ruft axios.create() und use() schon beim IMPORT auf. Vitest 5 löscht
// Mock-Aufrufe aber vor jedem Test (clearMocks ist standardmäßig an).
// Deshalb die Aufrufe hier sofort festhalten.
const createCalls = [...vi.mocked(axios.create).mock.calls]
const requestUseCalls = [...fakeInstance.interceptors.request.use.mock.calls]
const responseUseCalls = [...fakeInstance.interceptors.response.use.mock.calls]

/** Minimale Request-Config, wie Axios sie an den Interceptor übergibt */
function makeConfig(headers: Record<string, string> = {}): InternalAxiosRequestConfig {
  return { headers: { ...headers } } as unknown as InternalAxiosRequestConfig
}

/** Minimaler Fehler mit HTTP-Status */
function makeError(status?: number, code?: string): AxiosError {
  return { response: status ? { status } : undefined, code } as unknown as AxiosError
}

describe('api.ts – Verdrahtung', () => {
  test('axios.create erhält baseURL, Timeout und Accept-Header', () => {
    expect(createCalls).toEqual([
      [{ baseURL: '/api', timeout: 3000, headers: { Accept: 'application/json' } }],
    ])
  })

  test('Auth- und Fehler-Interceptor sind registriert', () => {
    expect(requestUseCalls).toContainEqual([attachAuthToken])
    expect(responseUseCalls).toContainEqual([expect.any(Function), handleResponseError])
  })
})

describe('Request-Interceptor attachAuthToken', () => {
  beforeEach(() => useAuthStore().login())

  test('hängt den Bearer-Token an', () => {
    const config = attachAuthToken(makeConfig())
    expect(config.headers.Authorization).toBe('Bearer demo-token-123')
  })

  test('überschreibt keinen explizit gesetzten Header', () => {
    const config = attachAuthToken(makeConfig({ Authorization: 'Bearer anderer' }))
    expect(config.headers.Authorization).toBe('Bearer anderer')
  })

  test('setzt keinen Header, wenn niemand angemeldet ist', () => {
    useAuthStore().logout()
    const config = attachAuthToken(makeConfig())
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('Response-Interceptor handleResponseError', () => {
  beforeEach(() => {
    useAuthStore().login()
    notifications.splice(0)
  })

  test('401 → abmelden, Hinweis anzeigen, Fehler weiterwerfen', async () => {
    const error = makeError(401)

    await expect(handleResponseError(error)).rejects.toBe(error)

    expect(useAuthStore().isLoggedIn).toBe(false)
    expect(notifications[0]).toMatchObject({ kind: 'warning', title: expect.stringContaining('401') })
  })

  test('500 → Fehlerhinweis, Anmeldung bleibt bestehen', async () => {
    await expect(handleResponseError(makeError(500))).rejects.toBeDefined()

    expect(useAuthStore().isLoggedIn).toBe(true)
    expect(notifications[0]).toMatchObject({ kind: 'error', title: expect.stringContaining('500') })
  })

  test('Timeout → Hinweis „Timeout“', async () => {
    await expect(handleResponseError(makeError(undefined, 'ECONNABORTED'))).rejects.toBeDefined()
    expect(notifications[0]?.title).toBe('Timeout')
  })

  test('404 → kein globaler Hinweis, das regelt die Komponente', async () => {
    await expect(handleResponseError(makeError(404))).rejects.toBeDefined()
    expect(notifications).toHaveLength(0)
  })
})
