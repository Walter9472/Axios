<script setup lang="ts">
/**
 * Tab 3 – Cancellation.
 * Jede Eingabe startet sofort einen Request (absichtlich ohne Debounce).
 * Der Server antwortet erst nach 700 ms, deshalb werden ältere Requests
 * abgebrochen, bevor ihre Antwort ankommt → im Protokoll durchgestrichen.
 */
import { ref } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'
import { extractRegion } from '@/utils/codeRegion'
import composableSource from '@/composables/useUserSearch.ts?raw'
import CodeBlock from './CodeBlock.vue'

const query = ref('')
const { results, loading, error, search } = useUserSearch()

// Nur den Kern der search()-Funktion zeigen
const searchCode = extractRegion(composableSource, 'search')
</script>

<template>
  <section class="stage">
    <div class="intro">
      <h2>Veraltete Requests abbrechen</h2>
      <p class="hint">
        Tippe zügig „ada“. Jeder Tastendruck bricht den vorherigen Request über seinen
        <code>AbortController</code> ab. Nur die letzte Antwort wird angezeigt.
      </p>
    </div>

    <div class="split">
      <div class="search-col">
        <label for="search">Nutzer suchen</label>
        <input
          id="search"
          v-model="query"
          type="search"
          placeholder="z. B. ada"
          autocomplete="off"
          @input="search(query)"
        />
        <p class="state" aria-live="polite">
          <span v-if="loading">Suche läuft …</span>
          <span v-else-if="error" class="err">{{ error.message }}</span>
          <span v-else-if="query && results.length === 0">Keine Treffer für „{{ query }}“.</span>
          <span v-else-if="query">{{ results.length }} Treffer</span>
          <span v-else>Server antwortet bei Suchen absichtlich erst nach 700 ms.</span>
        </p>
        <ul class="results">
          <li v-for="u in results" :key="u.id">
            <strong>{{ u.name }}</strong> <span>@{{ u.username }}</span>
          </li>
        </ul>
      </div>
      <CodeBlock title="src/composables/useUserSearch.ts" :code="searchCode" />
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
  gap: var(--gap);
  align-items: start;
}

.search-col {
  display: grid;
  gap: 0.5rem;
}

label {
  font-weight: 650;
}

input {
  font-size: 1.4rem;
  padding: 0.55rem 0.8rem;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
  color: var(--ink);
}

input:focus {
  border-color: var(--accent);
  outline: none;
}

.state {
  margin: 0;
  min-height: 1.5em;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.err {
  color: var(--server);
}

.results {
  list-style: none;
  margin: 0;
  padding: 0;
}

.results li {
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--line);
}

.results span {
  color: var(--ink-soft);
  font-family: var(--mono);
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }
}
</style>
