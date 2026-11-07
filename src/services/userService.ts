/**
 * Fachlicher Service für Nutzer. Kennt die Endpunkte, aber nichts von
 * Token, Timeout oder Fehleranzeige – das erledigt die Instanz in api.ts.
 *
 * Jede Funktion gibt direkt die Daten zurück (response.data), sodass
 * Komponenten nie mit dem Axios-Response-Objekt arbeiten müssen.
 */
import { api } from './api'
import type { NewUser, User } from '@/types/user'

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data // bereits geparstes JSON, typisiert als User[]
}

// #region get-user
export async function getUser(id: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`)
  return data // 404 → Promise wird abgelehnt, landet im catch
}
// #endregion

/** Suche mit Abbruchsignal (AbortController) – siehe useUserSearch.ts */
export async function searchUsers(query: string, signal?: AbortSignal): Promise<User[]> {
  const { data } = await api.get<User[]>('/users', { params: { q: query }, signal })
  return data
}

export async function createUser(user: NewUser): Promise<User> {
  // Das Objekt wird automatisch zu JSON + Content-Type: application/json
  const { data } = await api.post<User>('/users', user)
  return data
}
