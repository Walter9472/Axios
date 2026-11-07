/**
 * Die Fehlerszenarien der Demo. Jedes Szenario ist ein ganz normaler
 * API-Aufruf – die Komponente ErrorScenarios.vue kennt keine URLs.
 */
import { api } from './api'
import { createUser, getUser } from './userService'

export interface Scenario {
  id: string
  label: string
  /** Was erwartet man? Steht im Button als Untertitel */
  expectation: string
  run: () => Promise<unknown>
}

export const scenarios: Scenario[] = [
  {
    id: 'ok',
    label: '200 Erfolg',
    expectation: 'GET /users/1',
    run: () => getUser(1),
  },
  {
    id: 'not-found',
    label: '404 Not Found',
    expectation: 'GET /users/999',
    run: () => getUser(999),
  },
  {
    id: 'validation',
    label: '422 Validierung',
    expectation: 'POST /users mit leerem Namen',
    run: () => createUser({ name: '' }),
  },
  {
    id: 'unauthorized',
    label: '401 Token ungültig',
    expectation: 'Request mit abgelaufenem Token',
    // Explizit gesetzter Header hat Vorrang vor dem Interceptor (siehe api.ts)
    run: () => api.get('/users', { headers: { Authorization: 'Bearer abgelaufen' } }),
  },
  {
    id: 'server-error',
    label: '500 Serverfehler',
    expectation: 'GET /demo/error/500',
    run: () => api.get('/demo/error/500'),
  },
  {
    id: 'timeout',
    label: 'Timeout',
    expectation: 'Server braucht 5 s, Timeout 3 s',
    run: () => api.get('/demo/slow', { params: { ms: 5000 } }),
  },
  {
    id: 'network',
    label: 'Netzwerkfehler',
    expectation: 'Server nicht erreichbar',
    // Request an einen Port, auf dem niemand lauscht → keine Antwort
    run: () => api.get('/health', { baseURL: 'http://127.0.0.1:9' }),
  },
]
