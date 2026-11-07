<script setup lang="ts">
/**
 * Zeigt TypeScript-Code mit einfacher Hervorhebung (Kommentare, Strings,
 * Schlüsselwörter). Bewusst ohne Bibliothek – ein paar reguläre Ausdrücke
 * reichen für kurze Demo-Ausschnitte.
 */
import { computed } from 'vue'

const props = defineProps<{
  code: string
  title?: string
}>()

const KEYWORDS =
  /\b(export|async|function|const|let|await|return|if|else|throw|new|import|from|type|interface|try|catch)\b/g

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Zeilenweise: erst Kommentar abtrennen, dann Strings, dann Schlüsselwörter.
// Der Text wird vorher escaped, deshalb ist v-html hier unbedenklich.
const highlighted = computed(() =>
  props.code
    .split('\n')
    .map((line) => {
      const commentAt = line.search(/\/\/(?![^`'"]*['"`][^`'"]*$)/)
      const codePart = commentAt === -1 ? line : line.slice(0, commentAt)
      const commentPart = commentAt === -1 ? '' : line.slice(commentAt)
      const code = escapeHtml(codePart)
        .replace(/(`[^`]*`|'[^']*'|"[^"]*")/g, '<span class="s">$1</span>')
        .replace(KEYWORDS, '<span class="k">$1</span>')
      return commentPart ? `${code}<span class="c">${escapeHtml(commentPart)}</span>` : code
    })
    .join('\n'),
)
</script>

<template>
  <figure class="code">
    <figcaption v-if="title">{{ title }}</figcaption>
    <pre><code v-html="highlighted" /></pre>
  </figure>
</template>

<style scoped>
.code {
  margin: 0;
  border-radius: var(--radius);
  background: var(--code-bg);
  color: var(--code-ink);
  overflow: hidden;
}

figcaption {
  padding: 0.45rem 0.9rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--code-comment);
  border-bottom: 1px solid #2c3746;
}

pre {
  margin: 0;
  padding: 0.85rem 0.9rem;
  /* Umbrechen statt horizontal scrollen – am Beamer bleibt alles sichtbar */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 0.8rem;
  line-height: 1.55;
}

pre :deep(.c) {
  color: var(--code-comment);
}

pre :deep(.s) {
  color: var(--code-string);
}

pre :deep(.k) {
  color: var(--code-keyword);
}
</style>
