'use strict'

const test = require('brittle')
const wsClose = require('../../../../lib/manager/events/ws_close')

test('manager:events:ws_close - emits selected ws id when ws found in wsPool', (t) => {
  t.plan(3)

  const wsId = 1000
  const manager = {
    getWS: () => ({ id: wsId }),
    notifyPlugins: (arg1, arg2, arg3, payload) => {
      t.is(payload.id, wsId)
    },
    emit: (eventName, payload) => {
      t.is(payload.id, wsId)
    },
    closeWS: (id) => {
      t.is(id, wsId)
    }
  }

  wsClose(manager, wsId)
})

test('manager:events:ws_close - returns when ws not found in wsPool', (t) => {
  t.plan(1)

  const manager = {
    getWS: () => undefined,
    emit: () => t.fail('emit should not be called')
  }

  const wsCloseReturnValue = wsClose(manager, 1000)
  t.is(wsCloseReturnValue, undefined)
})
