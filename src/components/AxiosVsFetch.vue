<script setup lang="ts">
/**
 * Tab 4 – Axios vs. fetch.
 * Dieselbe Aufgabe (einen Nutzer per ID laden) mit drei Implementierungen.
 * Der angezeigte Code ist der echte Quelltext der Services (Import per ?raw).
 */
import { computed, ref } from 'vue'
import { getUser } from '@/services/userService'
import { getUserFetch, getUserFetchNaive, HttpError } from '@/services/fetchUserService'
import { describeError } from '@/services/errors'
import { extractRegion } from '@/utils/codeRegion'
import userServiceSource from '@/services/userService.ts?raw'
import fetchServiceSource from '@/services/fetchUserService.ts?raw'
import CodeBlock from './CodeBlock.vue'

interface Outcome {
  ok: boolean
  /** Kurzbeschreibung: Wurde das Promise erfüllt oder abgelehnt? */
  verdict: string
  detail: string
}

const axiosCode = extractRegion(userServiceSource, 'get-user')
const fetchCode = extractRegion(fetchServiceSource, 'fetch-correct')
const naiveCode = extractRegion(fetchServiceSource, 'fetch-naive')

const userId = ref(999)
const running = ref(false)
const outcomes = ref<Record<'axios' | 'fetch' | 'naive', Outcome> | null>(null)

/** Führt eine Variante aus und beschreibt, ob das Promise erfüllt oder abgelehnt wurde */
async function attempt(fn: (id: number) => Promise<unknown>, id: number): Promise<Outcome> {
  try {
    const data = await fn(id)
    return { ok: true, verdict: 'Promise erfüllt', detail: JSON.stringify(data) }
  } catch (e) {
    if (e instanceof HttpError) {
      return { ok: false, verdict: `Promise abgelehnt (HttpError ${e.status})`, detail: e.message }
    }
    const info = describeError(e)
    const label = info.status ? `${info.code} ${info.status}` : (info.code ?? info.kind)
    return { ok: false, verdict: `Promise abgelehnt (${label})`, detail: info.message }
  }
}

/** Nur positive ganze Zahlen – ein leeres Feld würde sonst /users/ (die Liste) abfragen */
const validId = computed(() => Number.isInteger(userId.value) && userId.value > 0)

/**
 * Die „Falle“: fetch ohne Prüfung meldet Erfolg, obwohl die korrekte
 * fetch-Variante für dieselbe ID einen Fehler erkannt hat.
 * Abgeleitet aus den Ergebnissen, nicht aus dem aktuellen Eingabefeld.
 */
const isTrap = computed(() => !!outcomes.value && outcomes.value.naive.ok && !outcomes.value.fetch.ok)

async function runAll() {
  if (!validId.value) return
  running.value = true
  const id = userId.value
  const [axiosResult, fetchResult, naiveResult] = await Promise.all([
    attempt(getUser, id),
    attempt(getUserFetch, id),
    attempt(getUserFetchNaive, id),
  ])
  outcomes.value = { axios: axiosResult, fetch: fetchResult, naive: naiveResult }
  running.value = false
}

const differences = [
  ['HTTP 4xx/5xx', 'Promise wird abgelehnt', 'wird erfüllt, response.ok selbst prüfen'],
  ['JSON lesen', 'data ist schon geparst', 'await res.json()'],
  ['JSON senden', 'Objekt direkt übergeben', 'JSON.stringify + Content-Type'],
  ['Token / Querschnitt', 'Interceptor, einmal zentral', 'in jedem Aufruf oder eigener Wrapper'],
  ['Timeout', 'Option timeout', 'AbortSignal.timeout()'],
  ['Abbruch', 'signal (AbortController)', 'signal (AbortController)'],
  ['Abhängigkeit', 'npm-Paket, ca. 22 KB gzip', 'im Browser eingebaut'],
]
</script>

<template>
  <section class="stage">
    <div class="intro">
      <h2>Dieselbe Aufgabe, zweimal gelöst</h2>
      <p class="hint">Einen Nutzer per ID laden. Mit ID 999 antwortet der Server mit 404.</p>
    </div>

    <form class="controls" @submit.prevent="runAll">
      <label for="uid">Nutzer-ID</label>
      <input id="uid" v-model.number="userId" type="number" min="1" />
      <button class="btn" type="submit" :disabled="running || !validId">{{ running ? 'Läuft …' : 'Beide ausführen' }}</button>
      <button class="btn btn--ghost" type="button" @click="userId = userId === 1 ? 999 : 1">
        ID {{ userId === 1 ? '999' : '1' }} nehmen
      </button>
    </form>

    <div class="columns">
      <div class="col">
        <h3>Axios</h3>
        <CodeBlock title="userService.ts" :code="axiosCode" />
        <p class="note">Base-URL, Token und Timeout stecken in der Instanz (api.ts).</p>
        <div v-if="outcomes" :class="['outcome', outcomes.axios.ok ? 'outcome--ok' : 'outcome--fail']">
          <strong>{{ outcomes.axios.verdict }}</strong>
          <span>{{ outcomes.axios.detail }}</span>
        </div>
      </div>

      <div class="col">
        <h3>fetch</h3>
        <CodeBlock title="fetchUserService.ts" :code="fetchCode" />
        <p class="note">Taucht nicht im Protokoll auf: fetch läuft an den Axios-Interceptors vorbei.</p>
        <div v-if="outcomes" :class="['outcome', outcomes.fetch.ok ? 'outcome--ok' : 'outcome--fail']">
          <strong>{{ outcomes.fetch.verdict }}</strong>
          <span>{{ outcomes.fetch.detail }}</span>
        </div>
        <details class="naive">
          <summary>fetch ohne <code>res.ok</code>-Prüfung</summary>
          <CodeBlock :code="naiveCode" />
        </details>
        <div v-if="outcomes" :class="['outcome', 'outcome--naive', { 'outcome--trap': isTrap }]">
          <strong>Ohne Prüfung: {{ outcomes.naive.verdict }}</strong>
          <span>{{ outcomes.naive.detail }}</span>
        </div>
      </div>
    </div>

    <table>
      <caption>
        Unterschiede im Überblick
      </caption>
      <thead>
        <tr>
          <th scope="col">Aspekt</th>
          <th scope="col">Axios</th>
          <th scope="col">fetch</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[aspect, a, f] in differences" :key="aspect">
          <th scope="row">{{ aspect }}</th>
          <td>{{ a }}</td>
          <td>{{ f }}</td>
        </tr>
      </tbody>
    </table>
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

h3 {
  font-size: 1.1rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.controls input {
  width: 6rem;
  padding: 0.45rem 0.6rem;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
  color: var(--ink);
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gap);
  align-items: start;
}

.col {
  display: grid;
  gap: 0.6rem;
}

.note {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.outcome {
  display: grid;
  gap: 0.15rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius);
  border-left: 5px solid;
  background: var(--panel);
  font-size: 0.85rem;
}

.outcome span {
  font-family: var(--mono);
  font-size: 0.78rem;
  overflow-wrap: anywhere;
  color: var(--ink-soft);
}

.outcome--ok {
  border-color: var(--ok);
}

.outcome--fail {
  border-color: var(--client);
}

/* Die Falle: fetch ohne Prüfung „erfolgreich“, obwohl der Server 404 sagt */
.outcome--trap {
  border-color: var(--server);
  background: var(--server-soft);
}

.naive summary {
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-bottom: 0.4rem;
}

table {
  border-collapse: collapse;
  width: 100%;
  background: var(--panel);
  font-size: 0.85rem;
}

caption {
  text-align: left;
  font-weight: 700;
  padding-bottom: 0.4rem;
}

th,
td {
  text-align: left;
  padding: 0.45rem 0.7rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

thead th {
  color: var(--ink-soft);
  font-weight: 650;
}

@media (max-width: 900px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
