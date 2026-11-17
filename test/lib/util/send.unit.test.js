'use strict'

const test = require('brittle')
const createDebug = require('debug')
const util = require('util')
const send = require('../../../lib/ws2/send')

const authPacket = {
  event: 'auth',
  apiKey: 'API_KEY_VALUE',
  authSig: 'AUTH_SIG_VALUE',
  authPayload: 'AUTH_PAYLOAD_VALUE',
  authNonce: 'AUTH_NONCE_VALUE'
}

const captureDebug = (t) => {
  const lines = []
  const originalLog = createDebug.log

  createDebug.enable('bfx:api:ws2:send')
  createDebug.log = (...args) => lines.push(util.format(...args))

  t.teardown(() => {
    createDebug.log = originalLog
    createDebug.disable()
  })

  return lines
}

test('ws2:send - sends the original message and logs it redacted', (t) => {
  const lines = captureDebug(t)
  let sent = null

  send({
    isOpen: true,
    ws: { send: (json) => { sent = JSON.parse(json) } }
  }, authPacket)

  t.alike(sent, authPacket, 'original message is sent unredacted')
  t.is(lines.length, 1)
  t.ok(lines[0].includes('[REDACTED]'), 'log line is redacted')
  t.absent(lines[0].includes('API_KEY_VALUE'), 'apiKey not logged')
  t.absent(lines[0].includes('AUTH_SIG_VALUE'), 'authSig not logged')
})

test('ws2:send - buffers the original message and logs it redacted', (t) => {
  const lines = captureDebug(t)
  const state = { isOpen: false, sendBuffer: [] }

  send(state, authPacket)

  t.alike(state.sendBuffer, [authPacket], 'original message is buffered unredacted')
  t.is(lines.length, 1)
  t.absent(lines[0].includes('API_KEY_VALUE'), 'apiKey not logged')
})
