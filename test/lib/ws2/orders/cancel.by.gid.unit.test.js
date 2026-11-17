'use strict'

const test = require('brittle')
const cancelOrderByGid = require('../../../../lib/ws2/orders/cancel_by_gid')

const defaultState = {
  ev: {
    off: () => { },
    once: (_, handler) => { handler() }
  },
  emit: () => { },
  transform: false
}

const gid = 1234

test('ws2:orders:cancel_by_gid - emits order cancel event with order GID', (t) => {
  t.plan(1)

  cancelOrderByGid({
    ...defaultState,
    emit: (eventName, packet) => {
      if (eventName === 'exec:order:cancel-by-gid') {
        t.is(packet, gid)
      }
    }
  }, { gid })
})

test('ws2:orders:cancel_by_gid - returns a promise that resolves on a matching oc_multi-req notification', async (t) => {
  const handlers = {}

  const p = cancelOrderByGid({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => { handlers[eventName] = handler }
    }
  }, { gid })

  t.ok(handlers[`n:oc_multi-req:${gid}:success`], 'registers success handler')
  handlers[`n:oc_multi-req:${gid}:success`]([gid])

  await t.execution(p, 'promise resolves')
})

test('ws2:orders:cancel_by_gid - returns a promise that rejects on a matching oc_multi-req error notification', async (t) => {
  const handlers = {}

  const p = cancelOrderByGid({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => { handlers[eventName] = handler }
    }
  }, { gid })

  t.ok(handlers[`n:oc_multi-req:${gid}:error`], 'registers error handler')
  handlers[`n:oc_multi-req:${gid}:error`]([gid])

  await t.exception(p, 'promise rejects')
})
