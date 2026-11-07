/**
 * Fehler einordnen – ganz ohne Mock. Wir bauen echte AxiosError-Objekte,
 * so wie Axios sie in den drei Fällen der Doku erzeugt (Folie 6).
 */
import { describe, expect, test } from 'vitest'
import { AxiosError, CanceledError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { describeError } from '@/services/errors'

const config = { headers: {} } as InternalAxiosRequestConfig

function response(status: number, data: unknown): AxiosResponse {
  return { status, statusText: '', data, headers: {}, config }
}

describe('describeError', () => {
  test('error.response: Server hat mit 404 geantwortet', () => {
    const error = new AxiosError('Request failed with status code 404', 'ERR_BAD_REQUEST', config, {}, response(404, { status: 404, message: 'Nutzer 999 nicht gefunden' }))

    expect(describeError(error)).toEqual({
      kind: 'response',
      branch: 'error.response',
      status: 404,
      code: 'ERR_BAD_REQUEST',
      message: 'Nutzer 999 nicht gefunden', // Meldung aus dem Backend-Body
    })
  })

  test('error.request + ECONNABORTED: Timeout', () => {
    const error = new AxiosError('timeout of 3000ms exceeded', 'ECONNABORTED', config, {})
    expect(describeError(error)).toMatchObject({ kind: 'timeout', branch: 'error.request' })
  })

  test('error.request + ERR_NETWORK: Netzwerkfehler', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', config, {})
    expect(describeError(error)).toMatchObject({ kind: 'network', branch: 'error.request', code: 'ERR_NETWORK' })
  })

  test('sonst: Request wurde nie gesendet', () => {
    const error = new AxiosError('Invalid URL', 'ERR_INVALID_URL', config)
    expect(describeError(error)).toMatchObject({ kind: 'setup', branch: 'sonst' })
  })

  test('Abbruch über AbortController ist kein echter Fehler', () => {
    expect(describeError(new CanceledError())).toMatchObject({ kind: 'canceled', branch: 'axios.isCancel' })
  })

  test('Fremde Fehler werden als unknown durchgereicht', () => {
    expect(describeError(new TypeError('kaputt'))).toMatchObject({ kind: 'unknown', message: 'kaputt' })
  })
})
