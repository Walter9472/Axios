# Axios HTTP – Live-Demo

Demo-Projekt zur Einzelpräsentation **„Axios HTTP“ (Thema 10/30)** im Modul *Komponentenbasierte Entwicklung*, HTW Berlin, WiSe 2026/27.
Vortrag: 13.11.2026 · Walter Chidimtanda · Dozent: M.Sc. Eyad Adel Awad Wahdan

## Ziel

Eine kleine Vue-3-App, die in fünf Minuten zeigt, wie ein Frontend mit Axios gegen einen REST-Vertrag spricht:

1. **Requests & Interceptors**: eine zentrale Axios-Instanz, ein Request-Interceptor hängt den (Fake-)Token an
2. **Fehlerbehandlung**: 404, 422, 401, 500, Timeout und Netzwerkfehler auslösen und sehen, in welchem Zweig sie landen
3. **Cancellation**: Suche, bei der veraltete Requests per `AbortController` abgebrochen werden
4. **Axios vs. fetch**: dieselbe Aufgabe nebeneinander, inklusive der 404-Falle von `fetch`
5. **Tests**: Axios in Vitest auf drei Ebenen mocken

Die Demo läuft **komplett offline**. Ein lokales Express-Backend liefert die Daten und simuliert Fehler und Verzögerungen. Auch die Schriften liegen lokal.

## Voraussetzungen

- Node.js 22.18+ oder 24.12+ (getestet mit Node 26)
- npm

## Setup und Start

```bash
npm install        # einmalig, braucht Internet
npm run dev:all    # Backend (Port 3001) + Frontend (Port 5173) zusammen
```

Dann <http://localhost:5173> öffnen.

| Befehl | Was passiert |
| --- | --- |
| `npm run dev:all` | startet Backend und Frontend parallel (empfohlen) |
| `npm run dev` | nur das Vite-Frontend |
| `npm run dev:server` | nur das Mock-Backend |
| `npm test` | alle Vitest-Tests einmal ausführen (kein Backend nötig) |
| `npm run test:watch` | Tests im Watch-Modus |
| `npm run build` | Type-Check (`vue-tsc`) und Produktions-Build |

> Hinweis: npm meldet bei der Installation eventuell, dass das Install-Script von `esbuild` nicht ausgeführt wurde. Das ist für die Demo unkritisch, `tsx` funktioniert trotzdem.

## Architektur

```
Browser (Vue 3)                         Vite-Dev-Server             Mock-Backend
┌──────────────────────────────┐        ┌──────────────┐            ┌──────────────┐
│ Komponente (z. B. UserList)  │        │              │            │ Express 5    │
│   ↓ ruft Service auf         │        │  Proxy /api  │ ─────────▶ │ :3001        │
│ userService.ts               │ ─────▶ │  → :3001     │            │ Bearer-Check │
│   ↓ nutzt Instanz            │        │              │ ◀───────── │ Fehler/Delay │
│ api.ts (axios.create)        │        └──────────────┘            └──────────────┘
│   Request-Interceptor: Token │
│   Response-Interceptor: 401, │
│   5xx, Timeout → Hinweis     │
└──────────────────────────────┘
```

Komponenten kennen keine URLs und importieren nie `axios` direkt. Base-URL, Timeout, Token und Fehleranzeige stehen an genau einer Stelle (`src/services/api.ts`).

## Projektstruktur

```
server/
  index.ts              Mock-Backend (Express): Routen, Auth-Middleware, Fehler/Verzögerung
  data.ts               Beispielnutzer + Demo-Token
src/
  services/
    api.ts              Axios-Instanz + Request-/Response-Interceptor
    userService.ts      getUsers, getUser, searchUsers, createUser
    fetchUserService.ts dieselbe Aufgabe mit fetch (nur für den Vergleich)
    errors.ts           describeError(): response / request / sonst / Abbruch
    requestLog.ts       Logging-Interceptors für das Protokoll rechts
    scenarioService.ts  die Fehlerszenarien aus Tab 2
    auth.ts             Fake-Login (Store-ähnliche API)
    notifications.ts    globale Hinweise (Toasts)
  composables/
    useUserSearch.ts    Suche mit AbortController
  components/           eine Komponente pro Tab + Protokoll, Hinweise, Codeblock
  types/user.ts         Typen des REST-Vertrags
  utils/                Code-Ausschnitte (?raw), Statusfarben
tests/                  Vitest-Tests (siehe unten)
DEMO-SKRIPT.md          Ablauf für die 5 Minuten im Vortrag
CLAUDE.md               Projektkontext für KI-gestützte Weiterarbeit
```

## REST-Vertrag des Mock-Backends

Alle Routen außer `/api/health` verlangen `Authorization: Bearer demo-token-123`.

| Methode und Pfad | Antwort |
| --- | --- |
| `GET /api/health` | `{ status: "ok" }`, ohne Token |
| `GET /api/users` | Liste aller Nutzer |
| `GET /api/users?q=ada` | Suche, absichtlich 700 ms verzögert |
| `GET /api/users/:id` | ein Nutzer oder `404` |
| `POST /api/users` | anlegen, `422` bei Name unter 2 Zeichen |
| `GET /api/demo/error/:status` | antwortet mit dem gewünschten Fehlerstatus (400–599) |
| `GET /api/demo/slow?ms=5000` | antwortet erst nach `ms` Millisekunden |

Fehler haben immer das Format `{ "status": 404, "message": "…" }`.

## Tests

`npm test` führt 26 Tests in fünf Dateien aus. Sie zeigen die Mock-Ebenen von Folie 10:

| Datei | Mock | Zweck |
| --- | --- | --- |
| `api.interceptors.spec.ts` | `vi.mock('axios')` mit Factory | Instanz-Konfiguration und Interceptor-Funktionen |
| `userService.spec.ts` | `vi.mock('@/services/api')` | Services ohne Netzwerk (empfohlene Ebene) |
| `useUserSearch.spec.ts` | `vi.mock('@/services/userService')` | Abbruch alter Requests |
| `errors.spec.ts` | keiner | echte `AxiosError`-Objekte einordnen |
| `fetchUserService.spec.ts` | `vi.stubGlobal('fetch', …)` | Gegenprobe: `fetch` löst bei 404 erfolgreich auf |

Zwei Stolperfallen, die im Code kommentiert sind:

- Ein leeres `vi.mock('axios')` lässt `axios.create()` `undefined` liefern. Deshalb gibt es eine Factory mit Fake-Instanz.
- Vitest 5 löscht Mock-Aufrufe vor jedem Test (`clearMocks: true` ist Standard). Aufrufe, die beim Import passieren, müssen deshalb sofort gesichert werden.

## Technologien

Vue 3.5 (Composition API, `<script setup lang="ts">`) · TypeScript · Vite 8 · Axios 1.21.0 (exakt gepinnt, Lockfile committet) · Vitest 5 · Express 5 · Atkinson Hyperlegible (Fontsource)

Axios ist bewusst exakt gepinnt: Am 31.03.2026 wurden die Versionen 1.14.1 und 0.30.4 als Malware gemeldet (GHSA-fw8c-xr5c-95f9).
