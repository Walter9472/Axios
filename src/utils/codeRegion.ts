/**
 * Schneidet einen markierten Abschnitt aus einer Quelldatei heraus.
 *
 * Die Vergleichsansicht importiert die ECHTEN Quelldateien per Vite-Suffix
 * `?raw` als Text. So ist der angezeigte Code immer identisch mit dem Code,
 * der beim Klick tatsächlich ausgeführt wird – keine kopierten Snippets.
 *
 * Markierung in der Quelldatei:
 *   // #region name
 *   ...
 *   // #endregion
 */
export function extractRegion(source: string, name: string): string {
  const lines = source.split('\n')
  const start = lines.findIndex((l) => l.trim() === `// #region ${name}`)
  if (start === -1) return `// Region "${name}" nicht gefunden`
  const end = lines.findIndex((l, i) => i > start && l.trim().startsWith('// #endregion'))
  const region = lines.slice(start + 1, end === -1 ? undefined : end)
  // Gemeinsame Einrückung entfernen, damit eingerückte Funktionen links anfangen
  const indent = Math.min(...region.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length))
  return region
    .map((l) => l.slice(Number.isFinite(indent) ? indent : 0))
    .join('\n')
    .trimEnd()
}
