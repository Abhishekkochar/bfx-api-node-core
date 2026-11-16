'use strict'

const test = require('brittle')
const auth = require('../../../lib/ws2/auth')

const defaultState = {
  isOpen: true,
  ev: {
    off: () => { },
    // only fire success handlers by default, so tests don't leave rejected promises behind
    once: (eventName, handler) => {
      if (!eventName.endsWith(':error')) handler()
    }
  },
  authArgs: {
    apiKey: 'key',
    apiSecret: 'secret',
    dms: 4,
    calc: 0
  },
  ws: {
    send: () => { }
  }
}

test('ws2:auth - sends auth packet w/ dms and calc params', (t) => {
  t.plan(7)

  auth({
    ...defaultState,
    ws: {
      send: (json) => {
        const msg = JSON.parse(json)

        t.is(msg.event, 'auth')
        t.is(msg.apiKey, 'key')
        t.ok(msg.authSig)
        t.ok(msg.authPayload)
        t.ok(msg.authNonce)
        t.is(msg.dms, 4)
        t.is(msg.calc, 0)
      }
    }
  })
})

test('ws2:auth - sends auth packet w/ authToken', (t) => {
  t.plan(4)

  auth({
    ...defaultState,
    authArgs: {
      ...defaultState.authArgs,
      authToken: 'token'
    },
    ws: {
      send: (json) => {
        const msg = JSON.parse(json)

        t.is(msg.event, 'auth')
        t.is(msg.token, 'token')
        t.is(msg.dms, 4)
        t.is(msg.calc, 0)
      }
    }
  })
})

test('ws2:auth - binds auth success event listener', (t) => {
  t.plan(1)

  auth({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'event:auth:success') {
          handler()
          t.ok(handler)
        }
      }
    }
  })
})

test('ws2:auth - binds auth error listener', (t) => {
  t.plan(1)

  const p = auth({
    ...defaultState,
    ev: {
      off: () => { },
      once: (eventName, handler) => {
        if (eventName === 'event:auth:error') {
          handler()
          t.ok(handler)
        }
      }
    }
  })

  p.catch(() => { })
})
