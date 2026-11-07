<script setup lang="ts">
/**
 * Tab 5 – Tests. Die Tests laufen im Terminal (npm test); dieser Tab erklärt,
 * auf welcher Ebene jede Testdatei Axios ersetzt (Folie 10).
 */
const levels = [
  {
    file: 'tests/api.interceptors.spec.ts',
    mock: "vi.mock('axios')",
    what: 'Das ganze Axios-Modul wird ersetzt. Geprüft wird, dass api.ts die Instanz richtig konfiguriert und die Interceptors registriert. Die Interceptor-Funktionen werden direkt aufgerufen.',
  },
  {
    file: 'tests/userService.spec.ts',
    mock: "vi.mock('@/services/api')",
    what: 'Nur die eigene API-Schicht wird ersetzt. Die Services werden ohne Netzwerk getestet, genau wie auf der Folie.',
  },
  {
    file: 'tests/useUserSearch.spec.ts',
    mock: "vi.mock('@/services/userService')",
    what: 'Der Service liefert kontrollierte Promises. Geprüft wird, dass ein neuer Suchbegriff den alten Request abbricht.',
  },
  {
    file: 'tests/errors.spec.ts',
    mock: 'kein Mock',
    what: 'Echte AxiosError-Objekte werden gebaut und eingeordnet: response, request, Abbruch, Aufbaufehler.',
  },
  {
    file: 'tests/fetchUserService.spec.ts',
    mock: "vi.stubGlobal('fetch', …)",
    what: 'Gegenprobe: fetch ohne res.ok-Prüfung löst bei 404 erfolgreich auf.',
  },
]
</script>

<template>
  <section class="stage">
    <div class="intro">
      <h2>Axios in Tests ersetzen</h2>
      <p class="hint">Im Terminal ausführen. Die Tests brauchen weder Backend noch Netzwerk.</p>
    </div>

    <p class="command"><code>npm test</code></p>

    <ol class="levels">
      <li v-for="l in levels" :key="l.file">
        <code class="mock">{{ l.mock }}</code>
        <code class="file">{{ l.file }}</code>
        <p>{{ l.what }}</p>
      </li>
    </ol>
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

.command {
  margin: 0;
  justify-self: start;
  background: var(--code-bg);
  color: var(--code-ink);
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius);
  font-size: 1.3rem;
}

.levels {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.2rem;
}

.levels li {
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 0.15rem 1.25rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--line);
}

.mock {
  grid-row: span 2;
  font-weight: 700;
  color: var(--accent);
}

.file {
  font-size: 0.8rem;
  color: var(--ink-soft);
}

p {
  margin: 0;
  max-width: 68ch;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .levels li {
    grid-template-columns: 1fr;
  }

  .mock {
    grid-row: auto;
  }
}
</style>
