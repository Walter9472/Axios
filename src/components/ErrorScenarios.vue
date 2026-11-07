<script setup lang="ts">
/**
 * Tab 2 – Fehlerbehandlung.
 * Jeder Button löst ein Szenario aus. Angezeigt wird, in welchem Zweig der
 * Axios-Fehlerbehandlung das Ergebnis landet (Folie 6).
 */
import { ref } from 'vue'
import { scenarios, type Scenario } from '@/services/scenarioService'
import { describeError, type ErrorInfo } from '@/services/errors'
import { statusLabel, statusTone } from '@/utils/status'

type Branch = 'then' | ErrorInfo['branch']

interface Result {
  scenario: Scenario
  branch: Branch
  info?: ErrorInfo
  data?: unknown
}

const running = ref<string | null>(null)
const result = ref<Result | null>(null)

const branches: { id: Branch; title: string; text: string }[] = [
  { id: 'then', title: 'Erfolg', text: 'Status 2xx, data enthält geparstes JSON' },
  { id: 'error.response', title: 'error.response', text: 'Server hat geantwortet, Status außerhalb 2xx' },
  { id: 'error.request', title: 'error.request', text: 'Request gesendet, keine Antwort (Timeout, Netzwerk)' },
  { id: 'sonst', title: 'sonst', text: 'Request nie gesendet, z. B. ungültige Config' },
]

async function run(scenario: Scenario) {
  running.value = scenario.id
  try {
    // Bei Axios-Responses nur data anzeigen, Service-Funktionen liefern data schon direkt
    const value = await scenario.run()
    const data = value && typeof value === 'object' && 'data' in value ? value.data : value
    result.value = { scenario, branch: 'then', data }
  } catch (e) {
    const info = describeError(e)
    result.value = { scenario, branch: info.branch, info }
  } finally {
    running.value = null
  }
}
</script>

<template>
  <section class="stage">
    <div class="intro">
      <h2>Welcher Zweig fängt den Fehler?</h2>
      <p class="hint">
        Axios lehnt das Promise bei jedem Status außerhalb von 2xx ab. 401, 5xx, Timeout und Netzwerkfehler meldet
        zusätzlich der Response-Interceptor zentral (Hinweis unten rechts).
      </p>
    </div>

    <div class="buttons">
      <button
        v-for="s in scenarios"
        :key="s.id"
        type="button"
        class="scenario"
        :class="{ active: result?.scenario.id === s.id }"
        :disabled="running !== null"
        @click="run(s)"
      >
        <strong>{{ running === s.id ? 'Läuft …' : s.label }}</strong>
        <span>{{ s.expectation }}</span>
      </button>
    </div>

    <ol class="branches" aria-label="Zweige der Fehlerbehandlung">
      <li v-for="b in branches" :key="b.id" :class="{ hit: result?.branch === b.id }">
        <code>{{ b.title }}</code>
        <span>{{ b.text }}</span>
      </li>
    </ol>

    <div v-if="result" class="result" aria-live="polite">
      <template v-if="result.info">
        <span :class="['status', `status--${statusTone(result.info.kind, result.info.status)}`]">
          {{ statusLabel(result.info.kind, result.info.status) }}
        </span>
        <dl>
          <dt>error.code</dt>
          <dd>
            <code>{{ result.info.code ?? '–' }}</code>
          </dd>
          <dt>Meldung</dt>
          <dd>{{ result.info.message }}</dd>
        </dl>
      </template>
      <template v-else>
        <span class="status status--success">200</span>
        <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
      </template>
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

.buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.6rem;
}

.scenario {
  display: grid;
  gap: 0.15rem;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
  color: var(--ink);
}

.scenario:hover:not(:disabled) {
  border-color: var(--accent);
}

.scenario.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.scenario:disabled {
  cursor: progress;
}

.scenario span {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.branches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
}

.branches li {
  display: grid;
  gap: 0.2rem;
  align-content: start;
  padding: 0.6rem 0.75rem;
  border: 1.5px dashed var(--line);
  border-radius: var(--radius);
  color: var(--ink-soft);
  font-size: 0.8rem;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.branches code {
  font-size: 0.95rem;
  font-weight: 700;
}

.branches li.hit {
  border-style: solid;
  border-color: var(--ink);
  background: var(--panel);
  color: var(--ink);
}

.result {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

dl {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
}

dt {
  color: var(--ink-soft);
  font-size: 0.85rem;
}

dd {
  margin: 0;
}

pre {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.8rem;
  overflow-x: auto;
}

@media (max-width: 900px) {
  .branches {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
