/**
 * Die zentrale API-Schicht: EINE konfigurierte Axios-Instanz für die ganze App.
 *
 * Komponenten importieren nie axios direkt und kennen keine URLs. Sie rufen
 * Services auf (userService.ts), die diese Instanz nutzen. Dadurch stehen
 * Base-URL, Timeout, Token und Fehlerbehandlung an genau einer Stelle
 * und die Schicht lässt sich in Tests gezielt mocken.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from './auth'
import { notify } from './notifications'
import { installRequestLogger } from './requestLog'

// #region create
export const api = axios.create({
  baseURL: '/api', // Vite-Proxy → Backend
  timeout: 3000, // danach Fehler ECONNABORTED
  headers: { Accept: 'application/json' },
})
// #endregion

/**
 * Request-Interceptor: hängt vor JEDEM Request den Bearer-Token an.
 * Ein im einzelnen Request explizit gesetzter Authorization-Header hat
 * Vorrang (gleiche Logik wie bei der Config: Request > Instanz > Defaults).
 */
// #region request-interceptor
export function attachAuthToken(config: InternalAxiosRequestConfig) {
  const { token } = useAuthStore()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}
// #endregion

/**
 * Response-Interceptor (Fehlerzweig): behandelt Querschnittsfehler zentral.
 * Wichtig: Der Fehler wird danach WEITERGEWORFEN (Promise.reject), damit die
 * aufrufende Komponente trotzdem reagieren kann (z. B. Ladezustand beenden).
 */
// #region response-interceptor
export function handleResponseError(error: AxiosError) {
  if (axios.isCancel(error)) {
    return Promise.reject(error) // gewollter Abbruch: kein Hinweis anzeigen
  }

  const status = error.response?.status
  if (status === 401) {
    useAuthStore().logout()
    notify('warning', '401 – Sitzung abgelaufen', 'Token ungültig. Bitte oben erneut anmelden.')
  } else if (status !== undefined && status >= 500) {
    notify('error', `${status} – Serverfehler`, 'Bitte später erneut versuchen.')
  } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    notify('error', 'Timeout', 'Der Server hat nicht rechtzeitig geantwortet.')
  } else if (error.code === 'ERR_NETWORK') {
    notify('error', 'Netzwerkfehler', 'Server nicht erreichbar.')
  }
  // 4xx außer 401 (z. B. 404, 422) behandelt die Komponente selbst – fachlicher Fehler.

  return Promise.reject(error)
}
// #endregion

// Reihenfolge beachten: Request-Interceptors laufen in UMGEKEHRTER
// Registrierungsreihenfolge. Der Logger wird zuerst registriert, läuft also
// als letzter und sieht den bereits angehängten Token.
installRequestLogger(api)
api.interceptors.request.use(attachAuthToken)
api.interceptors.response.use((response) => response, handleResponseError)
