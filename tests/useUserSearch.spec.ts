/**
 * Cancellation testen: Der Service wird gemockt und liefert Promises, die wir
 * selbst auflösen. Wird das Abbruchsignal ausgelöst, lehnt das Promise mit
 * CanceledError ab – genau wie Axios es tun würde.
 */
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { AxiosError, CanceledError } from 'axios'
import type { User } from '@/types/user'

vi.mock('@/services/userService', () => ({
  searchUsers: vi.fn(),
}))

import { searchUsers } from '@/services/userService'
import { useUserSearch } from '@/composables/useUserSearch'

interface PendingCall {
  query: string
  signal?: AbortSignal
  resolve: (users: User[]) => void
  reject: (error: unknown) => void
}

const ada: User = { id: 1, name: 'Ada Lovelace', username: 'ada', email: 'ada@example.org', knownFor: '' }

/** Jeder Aufruf von searchUsers bleibt offen, bis der Test ihn auflöst */
let calls: PendingCall[]

beforeEach(() => {
  calls = []
  vi.mocked(searchUsers).mockImplementation(
    (query, signal) =>
      new Promise((resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new CanceledError()))
        calls.push({ query, signal, resolve, reject })
      }),
  )
})

describe('useUserSearch', () => {
  test('neuer Suchbegriff bricht den alten Request ab', async () => {
    const { search, results, loading, error } = useUserSearch()

    const first = search('a')
    const second = search('ada')

    expect(calls[0]?.signal?.aborted).toBe(true) // „a“ wurde abgebrochen
    expect(calls[1]?.signal?.aborted).toBe(false) // „ada“ läuft noch

    calls[1]?.resolve([ada])
    await Promise.all([first, second])

    expect(results.value).toEqual([ada])
    expect(error.value).toBeNull() // Abbruch ist kein Fehler
    expect(loading.value).toBe(false)
  })

  test('leerer Suchbegriff bricht ab und leert die Ergebnisse', async () => {
    const { search, results, loading } = useUserSearch()

    const pending = search('ad')
    await search('')
    await pending

    expect(calls[0]?.signal?.aborted).toBe(true)
    expect(results.value).toEqual([])
    expect(loading.value).toBe(false)
  })

  test('echter Fehler wird angezeigt', async () => {
    const { search, error } = useUserSearch()

    const pending = search('ada')
    calls[0]?.reject(new AxiosError('Network Error', 'ERR_NETWORK', undefined, {}))
    await pending

    expect(error.value).toMatchObject({ kind: 'network' })
  })
})
