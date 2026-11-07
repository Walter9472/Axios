<script setup lang="ts">
/**
 * Zeigt den (Fake-)Anmeldestatus. Der Token wird hier NICHT an Requests
 * gehängt – das macht ausschließlich der Request-Interceptor in api.ts.
 */
import { useAuthStore } from '@/services/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="auth" :class="{ 'auth--out': !auth.isLoggedIn }">
    <span class="dot" aria-hidden="true" />
    <span v-if="auth.isLoggedIn">
      Angemeldet, Token <code>{{ auth.token }}</code>
    </span>
    <span v-else>Abgemeldet, kein Token</span>
    <button v-if="auth.isLoggedIn" class="btn btn--ghost" type="button" @click="auth.logout()">Abmelden</button>
    <button v-else class="btn" type="button" @click="auth.login()">Anmelden</button>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.9rem;
}

.dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: var(--ok);
}

.auth--out .dot {
  background: var(--server);
}

.btn {
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
}
</style>
