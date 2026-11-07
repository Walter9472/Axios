# Demo-Skript: 5 Minuten Axios live

Vortrag am 13.11.2026. Die Demo folgt Folie 12 („Live-Demo · 5 Minuten“): api.ts, Interceptors, Suche, Vitest. Dazu kommen Fehlerbehandlung und der fetch-Vergleich.

## Vorbereitung (vor dem Vortrag, ca. 10 Minuten)

- [ ] Zu Hause: `npm install` (danach ist kein Internet mehr nötig)
- [ ] Laptop am Beamer: `npm run dev:all` im Terminal starten, <http://localhost:5173> im Browser öffnen
- [ ] Browser-Zoom auf 125 % (Cmd +), Vollbild, Lesezeichenleiste aus
- [ ] Zweites Terminal mit großer Schrift im Projektordner bereithalten (für `npm test`)
- [ ] Editor mit `src/services/api.ts` und `tests/userService.spec.ts` offen (nur für Rückfragen)
- [ ] Einmal „Leeren“ im Protokoll klicken, Tab 1 aktiv, angemeldet
- [ ] Nicht stören: Benachrichtigungen aus
- [ ] Folie 12 aktualisieren: statt „JSONPlaceholder (Fake-REST-API)“ besser „lokales Mock-Backend (Express)“

Tipp: Die Tasten **1 bis 5** wechseln die Tabs, ohne zur Maus zu greifen.

## Ablauf

### 0:00–0:30 · Einstieg

**Zeigen:** Die App mit dem leeren Request-Protokoll rechts.

**Sagen:** „Eine kleine Vue-App mit einem lokalen Backend, alles läuft offline. Rechts seht ihr das Protokoll. Das füllen keine Komponenten, sondern Interceptors. Jeder Request, der durch Axios geht, taucht dort auf.“

### 0:30–1:30 · Tab 1: Instanz und Request-Interceptor

**Zeigen:**
1. Auf den Code links zeigen: `axios.create` mit `baseURL` und `timeout`, darunter `attachAuthToken`.
2. **„Nutzer laden“** klicken. Im Protokoll erscheint `GET /api/users`, `200`, `Bearer demo-token-123`.
3. Oben rechts **„Abmelden“** klicken, dann wieder **„Nutzer laden“**. Im Protokoll steht rot „kein Authorization-Header“, der Server antwortet mit `401`, unten rechts erscheint der Hinweis.
4. **„Anmelden“** klicken.

**Sagen:** „Die Komponente ruft nur `getUsers()` auf. Sie kennt weder URL noch Token. Den Header hängt der Request-Interceptor an, und zwar bei jedem Request. Ohne Token kommt 401, und darauf reagiert der Response-Interceptor zentral, nicht die Komponente.“

### 1:30–2:45 · Tab 2: Fehlerbehandlung

**Zeigen:**
1. **404 Not Found**: Der Kasten `error.response` leuchtet auf, Code `ERR_BAD_REQUEST`, Meldung aus dem Backend. Es gibt keinen globalen Hinweis.
2. **500 Serverfehler**: wieder `error.response`, Code `ERR_BAD_RESPONSE`. Diesmal erscheint der Hinweis vom Interceptor.
3. **Timeout**: drei Sekunden warten (kurz Spannung aufbauen). Jetzt leuchtet `error.request`, Code `ECONNABORTED`, und im Protokoll ist die Zeile gestrichelt.
4. Bei Zeit: **Netzwerkfehler** (`ERR_NETWORK`).

**Sagen:** „Axios lehnt das Promise bei jedem Status außerhalb 2xx ab. Ich muss nur unterscheiden: Hat der Server geantwortet (`error.response`) oder kam gar nichts zurück (`error.request`)? 404 ist ein fachlicher Fehler, den behandelt die Komponente. 500 und Timeout sind Querschnitt, die behandelt der Interceptor.“

### 2:45–3:30 · Tab 3: Abbrechen

**Zeigen:** Ins Suchfeld zügig `ada` tippen. Im Protokoll stehen zwei durchgestrichene Requests (`ERR_CANCELED`) und einer mit `200`.

**Sagen:** „Jeder Tastendruck schickt einen Request, der Server braucht 700 Millisekunden. Ohne Abbruch könnte die Antwort für ‚a‘ zuletzt ankommen und das richtige Ergebnis überschreiben. Mit `AbortController` brechen wir den alten Request ab. `CanceledError` ist gewollt und wird nicht als Fehler angezeigt.“

### 3:30–4:15 · Tab 4: Axios vs. fetch

**Zeigen:** Mit ID 999 auf **„Beide ausführen“** klicken.
- Axios: „Promise abgelehnt (ERR_BAD_REQUEST 404)“
- fetch korrekt: ebenfalls abgelehnt, aber nur dank der eigenen `res.ok`-Prüfung
- fetch ohne Prüfung: **rot hinterlegt, „Promise erfüllt“** mit dem Fehler-Body als „Nutzer“

**Sagen:** „Das ist die Falle von Folie 2. Und schaut auf die Codelänge: Alles, was bei Axios in der Instanz steckt, muss ich bei fetch in jede Funktion schreiben. Übrigens taucht fetch rechts im Protokoll gar nicht auf, weil es an den Interceptors vorbeiläuft.“

### 4:15–5:00 · Tab 5 und Terminal: Tests

**Zeigen:** Ins Terminal wechseln und `npm test` ausführen. 26 grüne Tests mit deutschen Namen erscheinen nach unter einer Sekunde.

**Sagen:** „Kein Backend, kein Netzwerk. In `userService.spec.ts` ersetze ich mit `vi.mock` meine eigene API-Schicht, genau wie auf der Folie. Und die Interceptors sind ganz normale Funktionen, die ich direkt testen kann.“

**Überleitung:** „Damit zurück zu den Folien, Fazit und Diskussion.“

## Was weglassen, wenn die Zeit knapp wird

Reihenfolge der Kürzungen: zuerst Netzwerkfehler in Tab 2, dann Abmelden in Tab 1, dann Tab 3. Tab 4 und die Tests bleiben drin, weil sie die Pflicht-Schwerpunkte abdecken.

## Plan B

| Problem | Lösung |
| --- | --- |
| `npm run dev:all` startet nicht, Port belegt | `lsof -i :5173 -i :3001` zeigt den Prozess, mit `kill <PID>` beenden und neu starten |
| Backend abgestürzt (alles „502 – Serverfehler“) | Der Vite-Proxy ist noch erreichbar und antwortet mit 502, deshalb ist es *kein* Netzwerkfehler. Gut für eine Diskussionsfrage. Im Terminal `npm run dev:server` neu starten (oder `dev:all` komplett neu) |
| Port 3001 belegt | `API_PORT=3005 npm run dev:all`: Backend und Proxy nutzen beide diese Variable |
| Seite hängt oder sieht komisch aus | Cmd+R. Der Zustand ist egal, das Protokoll startet leer |
| Nach 401 bleibt alles rot | Oben rechts auf „Anmelden“ klicken |
| Browser oder Beamer streikt komplett | Nur `npm test` im Terminal zeigen (läuft ohne Backend) und den Code in `api.ts` im Editor erklären |
| Kein Strom oder Laptop-Probleme | Folien 5–10 enthalten den Code. Den Ablauf mündlich an den Folien erklären, das Repo verlinken |

Empfehlung: Vorher eine Bildschirmaufnahme der Demo machen (Cmd+Shift+5) und auf dem Desktop ablegen.

## Mögliche Rückfragen

- **Warum kein Pinia?** Die Demo soll nur Axios zeigen. `useAuthStore()` hat dieselbe API wie ein Pinia-Store und lässt sich 1:1 ersetzen.
- **Warum wirft der Interceptor den Fehler weiter?** Damit die Komponente trotzdem reagieren kann, zum Beispiel ihren Ladezustand beenden. Würde der Interceptor schlucken, liefe der Aufrufer mit `undefined` weiter.
- **Warum Vite-Proxy?** Gleiche Origin im Browser, also kein CORS-Thema. In Produktion übernimmt das ein Reverse-Proxy oder die Backend-Konfiguration.
- **Request-Interceptors laufen in umgekehrter Reihenfolge?** Ja. Der Logger ist zuerst registriert, läuft also zuletzt und sieht schon den Token (Kommentar in `api.ts`).
- **Warum kein Debounce bei der Suche?** Bewusst weggelassen, damit man die Abbrüche sieht. In echt würde man beides kombinieren: Debounce reduziert Requests, Abbruch verhindert Race Conditions.
