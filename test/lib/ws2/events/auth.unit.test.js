'use strict'

const test = require('brittle')
const onAuthEvent = require('../../../../lib/ws2/events/auth')

const defaultState = {
  channels: {},
  emit: () => {}
}

const authSuccessPacket = {
  chanId: 0,
  msg: 'successfully authenticated',
  status: 'OK'
}

const authErrorPacket = {
  chanId: 0,
  msg: 'authentication error',
  status: 'ERROR'
}

test('ws2:events:auth - emits auth event', (t) => {
  t.plan(1)

  onAuthEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:auth') {
        t.alike(packet, authSuccessPacket)
      }
    }
  }, authSuccessPacket)
})

test('ws2:events:auth - emits error event if auth failed', (t) => {
  t.plan(1)

  onAuthEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'error') {
        t.ok(data instanceof Error)
      }
    }
  }, authErrorPacket)
})

test('ws2:events:auth - emits auth error event if auth failed', (t) => {
  t.plan(1)

  onAuthEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:auth:error') {
        t.alike(packet, authErrorPacket)
      }
    }
  }, authErrorPacket)
})

test('ws2:events:auth - emits auth success event if auth succeeded', (t) => {
  t.plan(1)

  onAuthEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:auth:success') {
        t.alike(packet, authSuccessPacket)
      }
    }
  }, authSuccessPacket)
})

test('ws2:events:auth - sets authenticated flag and auth channel if auth succeeded', (t) => {
  const nextState = onAuthEvent(defaultState, authSuccessPacket)

  t.ok(nextState.authenticated)
  t.ok(nextState.channels[0])
  t.alike(nextState.channels[0], { channel: 'auth' })
})
