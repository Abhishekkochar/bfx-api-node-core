'use strict'

const test = require('brittle')
const submitOrder = require('../../../../lib/ws2/orders/submit')
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
  cid: 42,
  type: 'LIMIT',
  price: 123,
  amount: 12
})

test('ws2:orders:submit - emits order submit event with new-order packet', (t) => {
  t.plan(1)

  submitOrder({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'exec:order:submit') {
        t.alike(packet, order.toNewOrderPacket())
      }
    }
  }, order)
})

test('ws2:orders:submit - returns a promise that resolves on a matching on-req notification', (t) => {
  t.plan(1)

  submitOrder({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'n:on-req:42:success') {
          handler()
          t.ok(handler)
        }
      }
    }
  }, order)
})

test('ws2:orders:submit - returns a promise that rejects on a matching on-req error notification', (t) => {
  t.plan(1)

  submitOrder({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'n:on-req:42:error') {
          t.ok(handler)
        } else {
          handler()
        }
      }
    }
  }, order)
})
