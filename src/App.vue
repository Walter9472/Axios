<script setup lang="ts">
/**
 * Rahmen der Demo: Kopfzeile mit Anmeldestatus, fünf Tabs in Vortragsreihenfolge
 * (wie Folie 12), rechts das Request-Protokoll, unten links die Hinweise.
 * Tasten 1–5 wechseln den Tab – praktisch beim Vortragen.
 */
import { onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import AuthStatus from './components/AuthStatus.vue'
import AxiosVsFetch from './components/AxiosVsFetch.vue'
import ErrorScenarios from './components/ErrorScenarios.vue'
import NotificationToasts from './components/NotificationToasts.vue'
import RequestLog from './components/RequestLog.vue'
import TestsInfo from './components/TestsInfo.vue'
import UserList from './components/UserList.vue'
import UserSearch from './components/UserSearch.vue'

interface Tab {
  title: string
  component: Component
}

const tabs: Tab[] = [
  { title: 'Requests & Interceptors', component: UserList },
  { title: 'Fehlerbehandlung', component: ErrorScenarios },
  { title: 'Abbrechen', component: UserSearch },
  { title: 'Axios vs. fetch', component: AxiosVsFetch },
  { title: 'Tests', component: TestsInfo },
]

const active = ref(0)

function onKey(event: KeyboardEvent) {
  // Nicht reagieren, während in ein Eingabefeld getippt wird
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select') || event.metaKey || event.ctrlKey || event.altKey) return
  const index = Number(event.key) - 1
  if (index >= 0 && index < tabs.length) active.value = index
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="app">
    <header class="top">
      <h1>Axios HTTP <span>Live-Demo</span></h1>
      <AuthStatus />
    </header>

    <nav class="tabs" aria-label="Demo-Schritte">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.title"
        type="button"
        :class="{ active: active === i }"
        :aria-current="active === i ? 'step' : undefined"
        @click="active = i"
      >
        <span class="num">{{ i + 1 }}</span>
        {{ tab.title }}
      </button>
    </nav>

    <div class="body">
      <main class="stage">
        <!-- KeepAlive: Ergebnisse bleiben beim Tab-Wechsel erhalten -->
        <KeepAlive>
          <component :is="tabs[active]!.component" />
        </KeepAlive>
      </main>
      <RequestLog class="log" />
    </div>

    <NotificationToasts />
  </div>
</template>

<style scoped>
.app {
  max-width: 1500px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem 2rem;
  display: grid;
  gap: 1rem;
}

.top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem 2rem;
}

h1 {
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

h1 span {
  font-weight: 400;
  color: var(--ink-soft);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  border-bottom: 2px solid var(--line);
}

.tabs button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 0;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  padding: 0.55rem 0.8rem;
  color: var(--ink-soft);
  font-weight: 600;
}

.tabs button:hover {
  color: var(--ink);
}

.tabs button.active {
  color: var(--ink);
  border-bottom-color: var(--accent);
}

.num {
  display: inline-grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  font-size: 0.8rem;
}

.tabs button.active .num {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 21rem;
  gap: 1.25rem;
  align-items: start;
}

.stage {
  min-width: 0;
}

.log {
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
}

@media (max-width: 1100px) {
  .body {
    grid-template-columns: 1fr;
  }

  .log {
    position: static;
    max-height: 28rem;
  }
}

@media (max-width: 600px) {
  .app {
    padding: 1rem 1rem 2rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
