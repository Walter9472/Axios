/**
 * Globale Hinweise („Toasts“). Der Response-Interceptor schreibt hier hinein,
 * die Komponente NotificationToasts.vue zeigt sie an.
 * So muss keine einzelne Komponente 401/500/Timeout selbst behandeln.
 */
import { reactive } from 'vue'

export type NotificationKind = 'info' | 'warning' | 'error'

export interface Notification {
  id: number
  kind: NotificationKind
  title: string
  text: string
}

export const notifications = reactive<Notification[]>([])

let nextId = 1
const DISPLAY_MS = 4500

export function notify(kind: NotificationKind, title: string, text: string): void {
  const id = nextId++
  notifications.push({ id, kind, title, text })
  setTimeout(() => dismiss(id), DISPLAY_MS)
}

export function dismiss(id: number): void {
  const index = notifications.findIndex((n) => n.id === id)
  if (index !== -1) notifications.splice(index, 1)
}
