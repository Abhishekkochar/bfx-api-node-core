'use strict'

const test = require('brittle')
const onConfigEvent = require('../../../../lib/ws2/events/config')

const defaultState = {
  emit: () => {}
}

const successPacket = {
  status: 'OK',
  flags: 0
}

const errorPacket = {
  status: 'ERROR',
  flags: 0
}

test('ws2:events:config - emits config event', (t) => {
  t.plan(1)

  onConfigEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:config') {
        t.alike(packet, successPacket)
      }
    }
  }, successPacket)
})

test('ws2:events:config - emits error event if config failed', (t) => {
  t.plan(1)

  onConfigEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'error') {
        t.ok(data instanceof Error)
      }
    }
  }, errorPacket)
})

test('ws2:events:config - emits config error event if config failed', (t) => {
  t.plan(1)

  onConfigEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:config:error') {
        t.alike(packet, errorPacket)
      }
    }
  }, errorPacket)
})

test('ws2:events:config - emits config success event if config succeeded', (t) => {
  t.plan(1)

  onConfigEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:config:success') {
        t.alike(packet, successPacket)
      }
    }
  }, successPacket)
})

test('ws2:events:config - updates state flags if config succeeded', (t) => {
  const nextState = onConfigEvent(defaultState, successPacket)
  t.is(nextState.flags, 0)
})
