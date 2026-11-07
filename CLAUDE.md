# CLAUDE.md – Projektkontext

## Auftrag

Live-Demo für Walters Einzelpräsentation **„Axios HTTP“ (Thema 10/30)** im Modul *Komponentenbasierte Entwicklung* (HTW Berlin, WiSe 26/27, Dozent M.Sc. Eyad Adel Awad Wahdan).

- Vortrag: **Fr, 13.11.2026** (20 Min.: 10 Folien, **5 Demo**, 5 Diskussion, ggf. 5 Feedback)
- Abgabe in Moodle bis **Do, 12.11.2026, 23:59**: .pptx, .pdf und Link zu diesem Repo (github.com/Walter9472/Axios)
- Pflicht-Schwerpunkte: Requests, Responses & Fehlerbehandlung · Interceptors (Auth) · Axios in Tests mocken (Vitest)
- Bewertung: Visualisierung, Inhalt & Struktur, Präsentationsperformanz (je 10 Punkte). Die Live-Demo zählt zur Visualisierung („verständlich und technisch sauber“).

## Rahmen

- Referenzarchitektur des Kurses: Frontend Vue 3 + TypeScript, Axios als HTTP-Client, REST/JSON-Vertrag zum Backend (Quarkus/Spring Boot). Prinzipien: Komponenten mit klarer Verantwortung, definierte Schnittstellen, serverseitige Validierung, Tests, Git, „lokal lauffähig mit einem Befehl“.
- Die Demo muss **offline** laufen. Deshalb gibt es das lokale Express-Backend in `server/` statt einer öffentlichen API. Auch die Schriften kommen aus node_modules.
- Die Folien liegen außerhalb des Repos (`../Präsentation/`). Code-Namen sind auf die Folien abgestimmt: `services/api.ts`, `userService.ts`, `useUserSearch.ts`, `vi.mock('@/services/api')`. **Nicht umbenennen**, ohne die Folien anzupassen.
- Folie 12 nennt noch „JSONPlaceholder“. Walter soll das auf „lokales Mock-Backend“ ändern.
- Dokumentation in Notion: Kursnotizen → „KBE – Präsentation Axios HTTP“ → „Demo – Aufbau & Erklärung“ (mit Unterseiten). Bestehende Inhalte dort nicht überschreiben.

## Befehle

```bash
npm run dev:all   # Backend :3001 + Vite :5173
npm test          # 26 Vitest-Tests, kein Backend nötig
npm run build     # vue-tsc + vite build
```

## Konventionen

- Vue 3 Composition API mit `<script setup lang="ts">`. Kommentare und UI-Texte **auf Deutsch**.
- Komponenten importieren nie `axios` und kennen keine URLs. Sie gehen immer über `src/services/*`.
- Kleine, verständliche Commits auf Deutsch. Abschluss mit Co-Authored-By-Zeile.
- Didaktik vor Vollständigkeit: lieber klein und erklärbar als featurereich.

## Stolperfallen

- **`// #region name` … `// #endregion`** in `api.ts`, `userService.ts`, `fetchUserService.ts` und `useUserSearch.ts` werden von der UI per `?raw` ausgeschnitten und angezeigt (`utils/codeRegion.ts`). Marker nicht löschen, Zeilen kurz halten (Beamer).
- Der Backend-Port kommt aus der Umgebungsvariable `API_PORT` (Standard 3001), nicht aus `PORT` (manche Tools setzen `PORT=5173`). `server/index.ts` und `vite.config.ts` lesen beide `API_PORT`.
- Ist das Backend aus, antwortet der Vite-Proxy mit 502. Das ist kein `ERR_NETWORK`.
- `ECONNABORTED` wird als Timeout gewertet, so steht es auch auf den Folien. Axios nutzt den Code auch für XHR-Aborts beim Neuladen der Seite; das wird bewusst in Kauf genommen.
- Vitest 5 hat standardmäßig `clearMocks: true`. Mock-Aufrufe, die beim Modul-Import entstehen, müssen sofort gesichert werden (siehe `tests/api.interceptors.spec.ts`).
- In `api.ts` ist die Reihenfolge der Interceptor-Registrierung Absicht: Request-Interceptors laufen in umgekehrter Reihenfolge, der Logger soll den Token sehen.
- Der Netzwerkfehler-Fall schickt einen Request an `http://localhost:3002`, dort läuft nichts. Port 9 o. Ä. nicht verwenden, weil Chrome ihn mit `ERR_UNSAFE_PORT` blockiert.
- Axios ist exakt auf `1.21.0` gepinnt (Malware-Vorfall 1.14.1/0.30.4, GHSA-fw8c-xr5c-95f9). Nicht auf `^` umstellen.
