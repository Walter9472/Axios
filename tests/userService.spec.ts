/**
 * Ebene 2 (Folie 10): Die EIGENE API-Schicht wird gemockt.
 *
 * vi.mock ersetzt das Modul '@/services/api' durch ein Objekt mit vi.fn()-
 * Methoden. Der Service merkt davon nichts – er ruft weiter api.get() auf,
 * bekommt aber unsere vorbereitete Antwort. Kein Netzwerk, kein Backend.
 */
import { describe, expect, test, vi } from 'vitest'

// vi.mock wird von Vitest automatisch an den Dateianfang gehoben (vor die Imports)
vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

import { api } from '@/services/api'
import { createUser, getUser, getUsers, searchUsers } from '@/services/userService'

// Hinweis: Vitest 5 löscht die Aufrufliste aller Mocks vor jedem Test (clearMocks: true)
describe('userService (API-Schicht gemockt)', () => {
  test('getUsers liefert data', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 1, name: 'Ada' }],
    })

    await expect(getUsers()).resolves.toEqual([{ id: 1, name: 'Ada' }])
    expect(api.get).toHaveBeenCalledWith('/users')
  })

  test('getUser baut die URL mit der ID', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { id: 7, name: 'Edsger Dijkstra' } })

    const user = await getUser(7)

    expect(user.name).toBe('Edsger Dijkstra')
    expect(api.get).toHaveBeenCalledWith('/users/7')
  })

  test('getUser reicht Fehler unverändert weiter (z. B. 404)', async () => {
    const error = new Error('Request failed with status code 404')
    vi.mocked(api.get).mockRejectedValue(error)

    await expect(getUser(999)).rejects.toBe(error)
  })

  test('searchUsers übergibt Suchbegriff als params und das Abbruchsignal', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    const controller = new AbortController()

    await searchUsers('ada', controller.signal)

    expect(api.get).toHaveBeenCalledWith('/users', { params: { q: 'ada' }, signal: controller.signal })
  })

  test('createUser sendet das Objekt direkt – Axios macht daraus JSON', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 11, name: 'Neu' } })

    await createUser({ name: 'Neu' })

    expect(api.post).toHaveBeenCalledWith('/users', { name: 'Neu' })
  })
})
