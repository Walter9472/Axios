/**
 * Lokales Mock-Backend für die Axios-Demo (Express 5).
 *
 * Warum ein eigenes Backend statt einer öffentlichen Fake-API?
 *  - Die Demo läuft komplett offline (kein WLAN-Risiko im Hörsaal).
 *  - Fehlerfälle (401, 404, 422, 500) und Verzögerungen sind gezielt auslösbar.
 *
 * Der REST-Vertrag ist bewusst klein:
 *   GET  /api/health                 → ohne Token, Lebenszeichen
 *   GET  /api/users?q=...            → Liste (mit q: Suche, absichtlich langsam)
 *   GET  /api/users/:id              → ein Nutzer oder 404
 *   POST /api/users                  → anlegen, serverseitige Validierung (422)
 *   GET  /api/demo/error/:status     → antwortet mit beliebigem Fehlerstatus
 *   GET  /api/demo/slow?ms=5000      → antwortet erst nach ms Millisekunden
 *
 * Alle Routen außer /api/health verlangen den Header
 *   Authorization: Bearer demo-token-123
 * Den hängt im Frontend der Request-Interceptor automatisch an.
 */
import express, { type NextFunction, type Request, type Response } from 'express'
import { DEMO_TOKEN, users, type User } from './data.ts'

// Eigener Variablenname (nicht PORT), damit kein Tool versehentlich den Vite-Port setzt.
// vite.config.ts liest dieselbe Variable für den Proxy.
const PORT = Number(process.env.API_PORT ?? 3001)
// Verzögerung der Suche, damit man abgebrochene Requests im Log sieht
const SEARCH_DELAY_MS = 700

const app = express()
app.use(express.json())

/** Kleine Hilfsfunktion: Promise, das nach ms Millisekunden auflöst */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Einheitliches Fehlerformat (wie man es auch in OpenAPI beschreiben würde) */
function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ status, message })
}

// Konsolen-Log je Request – hilfreich, um in der Demo auch die Serverseite zu zeigen
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const auth = req.headers.authorization ? 'mit Token' : 'ohne Token'
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start} ms, ${auth})`)
  })
  next()
})

// Lebenszeichen – bewusst ohne Authentifizierung
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Auth-Middleware: alles unterhalb von hier braucht den Bearer-Token
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization !== `Bearer ${DEMO_TOKEN}`) {
    sendError(res, 401, 'Nicht angemeldet: gültiger Bearer-Token fehlt')
    return
  }
  next()
})

app.get('/api/users', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
  if (!q) {
    res.json(users)
    return
  }
  await sleep(SEARCH_DELAY_MS)
  // Hat der Client den Request inzwischen abgebrochen, ist die Verbindung zu
  // und wir können uns die Antwort sparen.
  if (req.socket.destroyed) return
  res.json(users.filter((u) => u.name.toLowerCase().includes(q) || u.username.includes(q)))
})

app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id))
  if (!user) {
    sendError(res, 404, `Nutzer ${req.params.id} nicht gefunden`)
    return
  }
  res.json(user)
})

app.post('/api/users', (req, res) => {
  // Serverseitige Validierung (Prinzip aus der Referenzarchitektur)
  const body = (req.body ?? {}) as Partial<User>
  if (typeof body.name !== 'string' || body.name.trim().length < 2) {
    sendError(res, 422, 'Validierung fehlgeschlagen: "name" muss mindestens 2 Zeichen haben')
    return
  }
  const optionalFields = ['username', 'email', 'knownFor'] as const
  const invalid = optionalFields.find((f) => body[f] !== undefined && typeof body[f] !== 'string')
  if (invalid) {
    sendError(res, 422, `Validierung fehlgeschlagen: "${invalid}" muss ein Text sein`)
    return
  }
  const user: User = {
    id: Math.max(...users.map((u) => u.id)) + 1,
    name: body.name.trim(),
    username: body.username ?? body.name.trim().toLowerCase().split(' ')[0] ?? 'neu',
    email: body.email ?? 'neu@example.org',
    knownFor: body.knownFor ?? 'Neu angelegt in der Demo',
  }
  users.push(user)
  res.status(201).json(user)
})

app.get('/api/demo/error/:status', (req, res) => {
  const status = Number(req.params.status)
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    sendError(res, 400, 'Status muss zwischen 400 und 599 liegen')
    return
  }
  sendError(res, status, `Simulierter Fehler ${status}`)
})

app.get('/api/demo/slow', async (req, res) => {
  // Ungültige Werte → 5000; 0 bleibt 0 (kein „|| 5000“, sonst wäre 0 falsy)
  const requested = Number(req.query.ms ?? 5000)
  const ms = Number.isFinite(requested) ? Math.min(Math.max(requested, 0), 15000) : 5000
  await sleep(ms)
  if (req.socket.destroyed) return
  res.json({ message: `Antwort nach ${ms} ms` })
})

// Unbekannte /api-Routen → 404 im selben Format
app.use('/api', (_req, res) => {
  sendError(res, 404, 'Route nicht gefunden')
})

app.listen(PORT, () => {
  console.log(`Mock-Backend läuft auf http://localhost:${PORT}  (Token: ${DEMO_TOKEN})`)
})
