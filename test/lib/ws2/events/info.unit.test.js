'use strict'

const test = require('brittle')
const onInfoEvent = require('../../../../lib/ws2/events/info')
const Config = require('../../../../lib/config')

const defaultState = {
  emit: () => { },
  ws: {
    close: () => { }
  }
}

test('ws2:events:info - emits info event', (t) => {
  t.plan(1)

  const testPacket = { test: 42 }

  onInfoEvent({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'event:info') {
        t.alike(packet, testPacket)
      }
    }
  }, testPacket)
})

test('ws2:events:info - emits an error on API server version miss-match and closes the connection', (t) => {
  const versionErrorPacket = { version: 1 }
  let sawError = false
  let closedConnection = false

  onInfoEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'error') {
        t.ok(data instanceof Error)
        sawError = true
      }
    },

    ws: {
      close: () => {
        closedConnection = true
      }
    }
  }, versionErrorPacket)

  t.ok(sawError, 'emitted error')
  t.ok(closedConnection, 'closed connection')
})

test('ws2:events:info - emits server-restart event on associated info packet', (t) => {
  t.plan(1)

  const packet = {
    code: Config.INFO_CODES.SERVER_RESTART
  }

  onInfoEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'event:info:server-restart') {
        t.alike(data, packet)
      }
    }
  }, packet)
})

test('ws2:events:info - emits maintenance-start event on associated info packet', (t) => {
  t.plan(1)

  const packet = {
    code: Config.INFO_CODES.MAINTENANCE_START
  }

  onInfoEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'event:info:maintenance-start') {
        t.alike(data, packet)
      }
    }
  }, packet)
})

test('ws2:events:info - emits maintenance-end event on associated info packet', (t) => {
  t.plan(1)

  const packet = {
    code: Config.INFO_CODES.MAINTENANCE_END
  }

  onInfoEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'event:info:maintenance-end') {
        t.alike(data, packet)
      }
    }
  }, packet)
})
