<script setup lang="ts">
/** Zeigt die globalen Hinweise, die der Response-Interceptor auslöst. */
import { dismiss, notifications } from '@/services/notifications'
</script>

<template>
  <div class="toasts" role="status" aria-live="assertive">
    <TransitionGroup name="toast">
      <div v-for="n in notifications" :key="n.id" :class="['toast', `toast--${n.kind}`]">
        <div>
          <strong>{{ n.title }}</strong>
          <p>{{ n.text }}</p>
          <small>ausgelöst vom Response-Interceptor</small>
        </div>
        <button type="button" aria-label="Hinweis schließen" @click="dismiss(n.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  /* unten rechts: verdeckt höchstens ältere Zeilen im Protokoll, nie die Bühne */
  right: 1rem;
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 10;
  max-width: min(26rem, calc(100vw - 2rem));
}

.toast {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: var(--panel);
  border: 1.5px solid var(--line);
  border-left-width: 6px;
  border-radius: var(--radius);
  padding: 0.7rem 0.8rem;
}

.toast--warning {
  border-color: var(--client);
}

.toast--error {
  border-color: var(--server);
}

p {
  margin: 0.15rem 0 0.25rem;
}

small {
  color: var(--ink-soft);
}

button {
  margin-left: auto;
  background: none;
  border: 0;
  font-size: 1.3rem;
  line-height: 1;
  color: var(--ink-soft);
}

/* Reaktion auf ein Ereignis: Toast gleitet herein */
.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(1rem);
  opacity: 0;
}
</style>
