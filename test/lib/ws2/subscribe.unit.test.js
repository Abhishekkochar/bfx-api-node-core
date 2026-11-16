'use strict'

const test = require('brittle')
const subscribe = require('../../../lib/ws2/subscribe')

const defaultState = {
  pendingSubscriptions: [],
  channels: {},
  sendBuffer: [],
  emit: () => { }
}

test('ws2:subscribe - has pending subscription', (t) => {
  const nextState = subscribe(defaultState, 'book', {
    prec: 'R0',
    len: '25'
  })

  t.alike(nextState.pendingSubscriptions, [{
    channel: 'book',
    prec: 'R0',
    len: '25'
  }])
})

test('ws2:subscribe - prevent duplicate pending subscriptions', (t) => {
  const nextState = subscribe(defaultState, 'book', {
    prec: 'R0',
    len: '25'
  })
  const nextState2 = subscribe(nextState, 'book', {
    prec: 'R0',
    len: '25'
  })

  t.alike(nextState2.pendingSubscriptions, [{
    channel: 'book',
    prec: 'R0',
    len: '25'
  }])
})
