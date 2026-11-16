'use strict'

const test = require('brittle')
const updateOrder = require('../../../../lib/ws2/orders/update')

const defaultState = {
  ev: {
    off: () => { },
    once: (_, handler) => { handler() }
  },
  emit: () => { },
  transform: false
}

const changes = {
  id: 42,
  delta: 12
}

test('ws2:orders:update - emits order update event with the changeset', (t) => {
  t.plan(1)

  updateOrder({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'exec:order:update') {
        t.alike(packet, changes)
      }
    }
  }, changes)
})

test('ws2:orders:update - returns a promise that resolves on a matching ou-req notification', (t) => {
  t.plan(1)

  updateOrder({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'n:ou-req:42:success') {
          handler()
          t.ok(handler)
        }
      }
    }
  }, changes)
})

test('ws2:orders:update - returns a promise that rejects on a matching ou-req error notification', (t) => {
  t.plan(1)

  updateOrder({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'n:ou-req:42:error') {
          t.ok(handler)
        } else {
          handler()
        }
      }
    }
  }, changes)
})
