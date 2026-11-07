/**
 * Dieselbe Aufgabe wie getUser() aus userService.ts – nur mit nativem fetch.
 * Dient ausschließlich dem Vergleich in AxiosVsFetch.vue.
 *
 * Alles, was Axios über die Instanz und die Interceptors einmal zentral
 * erledigt, muss hier in JEDER Funktion selbst geschrieben werden:
 * Base-URL, Token-Header, Timeout, Statusprüfung und JSON-Parsing.
 */
import { useAuthStore } from './auth'
import type { ApiErrorBody, User } from '@/types/user'

const API_BASE = '/api'

/** Eigene Fehlerklasse, weil fetch bei 4xx/5xx gar keinen Fehler wirft */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/** Naive Variante (wie Folie 2): vergisst die Statusprüfung */
// #region fetch-naive
export async function getUserFetchNaive(id: number): Promise<User> {
  const { token } = useAuthStore()
  const res = await fetch(`${API_BASE}/users/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return res.json() // läuft auch bei 404!
}
// #endregion

/** Korrekte Variante: alles, was Axios automatisch macht, von Hand */
// #region fetch-correct
export async function getUserFetch(id: number): Promise<User> {
  const { token } = useAuthStore()
  const res = await fetch(`${API_BASE}/users/${id}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(3000), // Timeout per Signal
  })
  if (!res.ok) {
    // 4xx/5xx selbst in einen Fehler umwandeln
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null
    throw new HttpError(res.status, body?.message ?? res.statusText)
  }
  return (await res.json()) as User // selbst parsen
}
// #endregion
