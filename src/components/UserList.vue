<script setup lang="ts">
/**
 * Tab 1 – Requests & Interceptors.
 * Lädt die Nutzerliste über den Service und zeigt daneben den echten Code
 * aus api.ts (per ?raw importiert).
 */
import { ref } from 'vue'
import { getUsers } from '@/services/userService'
import { describeError, type ErrorInfo } from '@/services/errors'
import { extractRegion } from '@/utils/codeRegion'
import { statusLabel, statusTone } from '@/utils/status'
import apiSource from '@/services/api.ts?raw'
import CodeBlock from './CodeBlock.vue'
import type { User } from '@/types/user'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<ErrorInfo | null>(null)

const createCode = extractRegion(apiSource, 'create')
const interceptorCode = extractRegion(apiSource, 'request-interceptor')

async function load() {
  loading.value = true
  error.value = null
  try {
    users.value = await getUsers() // Komponente kennt keine URL und keinen Token
  } catch (e) {
    users.value = []
    error.value = describeError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="stage">
    <div class="intro">
      <h2>Eine Instanz, ein Interceptor, typisierte Daten</h2>
      <p class="hint">
        Die Komponente ruft nur <code>getUsers()</code> auf. Base-URL, Timeout und Token kommen aus der Instanz.
      </p>
    </div>

    <div class="split">
      <div class="code-col">
        <CodeBlock title="src/services/api.ts – Instanz" :code="createCode" />
        <CodeBlock title="src/services/api.ts – Request-Interceptor" :code="interceptorCode" />
      </div>

      <div class="result-col">
        <button class="btn" type="button" :disabled="loading" @click="load">
          {{ loading ? 'Lädt …' : 'Nutzer laden' }}
        </button>

        <p v-if="error" class="error" role="alert">
          <span :class="['status', `status--${statusTone(error.kind, error.status)}`]">
            {{ statusLabel(error.kind, error.status) }}
          </span>
          {{ error.message }}
        </p>

        <p v-else-if="users.length === 0 && !loading" class="hint">
          Klick auf „Nutzer laden“ und beobachte rechts den Authorization-Header.
        </p>

        <ul v-else class="users">
          <li v-for="u in users" :key="u.id">
            <strong>{{ u.name }}</strong>
            <span>{{ u.knownFor }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stage {
  display: grid;
  gap: var(--gap);
}

h2 {
  font-size: 1.35rem;
  margin-bottom: 0.3rem;
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: var(--gap);
  align-items: start;
}

.code-col {
  display: grid;
  gap: 0.75rem;
}

.result-col {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
}

.users {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  columns: 2 12rem;
  column-gap: 1.25rem;
}

.users li {
  break-inside: avoid;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--line);
  display: grid;
}

.users span {
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.error {
  margin: 0;
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }
}
</style>
