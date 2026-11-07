/**
 * Gegenprobe mit fetch: Hier gibt es kein Modul zum Mocken, also wird die
 * globale fetch-Funktion ersetzt (vi.stubGlobal). Der Test belegt die
 * Kernaussage von Folie 2: Ein 404 ist für fetch kein Fehler.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getUserFetch, getUserFetchNaive, HttpError } from '@/services/fetchUserService'
import { useAuthStore } from '@/services/auth'

const notFoundBody = { status: 404, message: 'Nutzer 999 nicht gefunden' }

beforeEach(() => {
  useAuthStore().login()
  // Jede Antwort neu erzeugen: ein Response-Body lässt sich nur einmal lesen
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(notFoundBody), { status: 404 })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetch vs. 404', () => {
  test('naives fetch löst bei 404 ERFOLGREICH auf', async () => {
    await expect(getUserFetchNaive(999)).resolves.toEqual(notFoundBody)
  })

  test('korrektes fetch muss res.ok selbst prüfen und wirft dann', async () => {
    const promise = getUserFetch(999)

    await expect(promise).rejects.toBeInstanceOf(HttpError)
    await expect(promise).rejects.toMatchObject({ status: 404, message: 'Nutzer 999 nicht gefunden' })
  })

  test('Token muss bei fetch in jedem Aufruf selbst gesetzt werden', async () => {
    await getUserFetch(999).catch(() => undefined)

    const [url, init] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/users/999')
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer demo-token-123' })
  })
})
