/**
 * Beispieldaten für das Mock-Backend.
 * Bewusst klein und statisch – die Demo soll Axios zeigen, nicht eine Datenbank.
 */

export interface User {
  id: number
  name: string
  username: string
  email: string
  knownFor: string
}

export const DEMO_TOKEN = 'demo-token-123'

export const users: User[] = [
  { id: 1, name: 'Ada Lovelace', username: 'ada', email: 'ada@example.org', knownFor: 'Erstes Computerprogramm' },
  { id: 2, name: 'Alan Turing', username: 'alan', email: 'alan@example.org', knownFor: 'Turingmaschine' },
  { id: 3, name: 'Grace Hopper', username: 'grace', email: 'grace@example.org', knownFor: 'Erster Compiler' },
  { id: 4, name: 'Konrad Zuse', username: 'konrad', email: 'konrad@example.org', knownFor: 'Z3, Berlin 1941' },
  { id: 5, name: 'Margaret Hamilton', username: 'margaret', email: 'margaret@example.org', knownFor: 'Apollo-Bordsoftware' },
  { id: 6, name: 'Barbara Liskov', username: 'barbara', email: 'barbara@example.org', knownFor: 'Liskovsches Substitutionsprinzip' },
  { id: 7, name: 'Edsger Dijkstra', username: 'edsger', email: 'edsger@example.org', knownFor: 'Kürzeste Wege' },
  { id: 8, name: 'Tim Berners-Lee', username: 'tim', email: 'tim@example.org', knownFor: 'World Wide Web & HTTP' },
  { id: 9, name: 'Katherine Johnson', username: 'katherine', email: 'katherine@example.org', knownFor: 'Bahnberechnungen NASA' },
  { id: 10, name: 'Adele Goldberg', username: 'adele', email: 'adele@example.org', knownFor: 'Smalltalk' },
]
