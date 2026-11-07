/**
 * Suche mit Request-Cancellation (Folie 8).
 *
 * Problem: Der Nutzer tippt „a“, „ad“, „ada“ – drei Requests laufen parallel.
 * Kommt die Antwort für „a“ zuletzt an, würde sie das richtige Ergebnis
 * überschreiben (Race Condition). Lösung: Vor jedem neuen Request wird der
 * alte über seinen AbortController abgebrochen.
 */
import { getCurrentScope, onScopeDispose, ref } from 'vue'
import { searchUsers } from '@/services/userService'
import { describeError, type ErrorInfo } from '@/services/errors'
import type { User } from '@/types/user'

export function useUserSearch() {
  const results = ref<User[]>([])
  const loading = ref(false)
  const error = ref<ErrorInfo | null>(null)

  // #region search
  let controller: AbortController | null = null

  async function search(query: string): Promise<void> {
    controller?.abort() // alten Request abbrechen
    error.value = null

    if (!query.trim()) {
      controller = null
      results.value = []
      loading.value = false
      return
    }

    const current = new AbortController()
    controller = current
    loading.value = true
    try {
      results.value = await searchUsers(query, current.signal)
    } catch (e) {
      const info = describeError(e)
      if (info.kind === 'canceled') return // gewollt
      error.value = info
    } finally {
      // nur der neueste Request beendet das Laden
      if (controller === current) loading.value = false
    }
  }
  // #endregion

  // Entspricht onUnmounted() in einer Komponente: offenen Request abbrechen
  if (getCurrentScope()) {
    onScopeDispose(() => controller?.abort())
  }

  return { results, loading, error, search }
}
