<script setup lang="ts">
/**
 * Live-Protokoll aller Axios-Requests. Die Daten kommen ausschließlich aus
 * den Logging-Interceptors (services/requestLog.ts) – keine Komponente
 * muss dafür etwas tun.
 */
import { clearRequestLog, requestLog } from '@/services/requestLog'
import { statusLabel, statusTone } from '@/utils/status'
</script>

<template>
  <aside class="log" aria-label="Request-Protokoll">
    <header>
      <h2>Request-Protokoll</h2>
      <button class="btn btn--ghost small" type="button" @click="clearRequestLog">Leeren</button>
    </header>
    <p class="legend">Jeder Request läuft durch die Interceptors. Hier steht, was sie gesehen haben.</p>

    <p v-if="requestLog.length === 0" class="empty">Noch keine Requests. Starte links eine Aktion.</p>

    <ol v-else aria-live="polite">
      <li v-for="entry in requestLog" :key="entry.id" :class="`row row--${statusTone(entry.outcome, entry.status)}`">
        <div class="line1">
          <span class="method">{{ entry.method }}</span>
          <span class="url">{{ entry.url }}</span>
          <span :class="['status', `status--${statusTone(entry.outcome, entry.status)}`]">
            {{ statusLabel(entry.outcome, entry.status) }}
          </span>
        </div>
        <div class="line2">
          <span v-if="entry.authorization" class="auth">{{ entry.authorization }}</span>
          <span v-else class="auth auth--none">kein Authorization-Header</span>
          <span v-if="entry.code" class="code">{{ entry.code }}</span>
          <span v-if="entry.durationMs !== undefined" class="ms">{{ entry.durationMs }} ms</span>
        </div>
      </li>
    </ol>
  </aside>
</template>

<style scoped>
.log {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 1rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

h2 {
  font-size: 1.05rem;
}

.small {
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
}

.legend {
  margin: 0.35rem 0 0.75rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.empty {
  color: var(--ink-soft);
  font-size: 0.9rem;
}

ol {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}

.row {
  padding: 0.55rem 0 0.55rem 0.7rem;
  border-top: 1px solid var(--line);
  border-left: 4px solid var(--line);
}

/* Neue Zeile kurz hervorheben – die einzige automatische Bewegung der Seite */
.row:first-child {
  animation: arrive 0.6s ease-out;
}

@keyframes arrive {
  from {
    background: var(--accent-soft);
  }
}

.row--success {
  border-left-color: var(--ok);
}

.row--client {
  border-left-color: var(--client);
}

.row--server {
  border-left-color: var(--server);
}

.row--nores {
  border-left-color: var(--nores);
  border-left-style: dashed;
}

.row--canceled {
  opacity: 0.6;
}

.row--pending {
  border-left-color: var(--accent);
}

.line1 {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.method {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 0.8rem;
}

.url {
  font-family: var(--mono);
  font-size: 0.85rem;
  flex: 1;
  overflow-wrap: anywhere;
}

.line2 {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: var(--ink-soft);
}

.auth {
  font-family: var(--mono);
  color: var(--accent);
}

.auth--none {
  color: var(--server);
  font-family: var(--font);
}

.code {
  font-family: var(--mono);
}

.ms {
  margin-left: auto;
}
</style>
