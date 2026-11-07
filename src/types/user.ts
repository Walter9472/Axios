/**
 * Datentypen des REST-Vertrags. In einem echten Projekt würden sie aus der
 * OpenAPI-Spezifikation generiert (Thema 11) – hier von Hand gepflegt.
 */
export interface User {
  id: number
  name: string
  username: string
  email: string
  knownFor: string
}

/** Payload zum Anlegen: id vergibt der Server */
export type NewUser = Partial<Omit<User, 'id'>> & { name: string }

/** Fehlerformat des Backends, z. B. { status: 404, message: "Nutzer 999 nicht gefunden" } */
export interface ApiErrorBody {
  status: number
  message: string
}
