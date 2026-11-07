/**
 * Minimaler Auth-Zustand für die Demo.
 *
 * Bewusst ohne Pinia, damit die Demo nur Axios zeigt. Die API ist aber so
 * gebaut wie ein Pinia-Store (useAuthStore().token / .logout()), damit der Code
 * zu den Folien passt und später 1:1 durch einen echten Store ersetzt werden kann.
 */
import { reactive } from 'vue'

/** Fake-Token – das Mock-Backend akzeptiert genau diesen Wert */
export const DEMO_TOKEN = 'demo-token-123'

const state = reactive({
  token: DEMO_TOKEN as string | null,
})

export function useAuthStore() {
  return {
    /** aktueller Token oder null, wenn abgemeldet */
    get token() {
      return state.token
    },
    get isLoggedIn() {
      return state.token !== null
    },
    login() {
      state.token = DEMO_TOKEN
    },
    logout() {
      state.token = null
    },
  }
}
