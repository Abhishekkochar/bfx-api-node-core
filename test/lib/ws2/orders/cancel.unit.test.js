'use strict'

const test = require('brittle')
const cancelOrder = require('../../../../lib/ws2/orders/cancel')
const { Order } = require('bfx-api-node-models')

const defaultState = {
  ev: {
    off: () => { },
    once: (_, handler) => { handler() }
  },
  emit: () => { },
  transform: false
}

const order = new Order({
  id: 42,
  type: 'LIMIT',
  price: 123,
  amount: 12
})

test('ws2:orders:cancel - emits order cancel event with order ID', (t) => {
  t.plan(1)

  cancelOrder({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'exec:order:cancel') {
        t.is(packet, order.id)
      }
    }
  }, order)
})

test('ws2:orders:cancel - returns a promise that resolves on a matching oc-req notification', (t) => {
  t.plan(1)

  cancelOrder({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'n:oc-req:42:success') {
          handler()
          t.ok(handler)
        }
      }
    }
  }, order)
})

test('ws2:orders:cancel - returns a promise that rejects on a matching oc-req error notification', (t) => {
  t.plan(1)

  cancelOrder({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'n:oc-req:42:error') {
          t.ok(handler)
        } else {
          handler()
        }
      }
    }
  }, order)
})
