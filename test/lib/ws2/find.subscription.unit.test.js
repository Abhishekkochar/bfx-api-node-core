'use strict'

const test = require('brittle')
const findSubscription = require('../../../lib/ws2/find_subscription')

const bookSubscriptions = [
  {
    channel: 'book',
    prec: 'R0',
    len: '25'
  },
  {
    channel: 'book',
    prec: 'R0',
    len: '50'
  }
]

test('ws2:find_subscription - not match', (t) => {
  const state = findSubscription([{ channel: 'auth' }], { channel: 'book' })

  t.is(state, undefined)
})

test('ws2:find_subscription - match strict', (t) => {
  const state = findSubscription(bookSubscriptions, { channel: 'book', len: '50' })

  t.alike(state, bookSubscriptions[1])
})

test('ws2:find_subscription - not match weak', (t) => {
  const state = findSubscription(bookSubscriptions, { channel: 'book', len: '50' }, true)

  t.is(state, undefined)
})

test('ws2:find_subscription - match weak', (t) => {
  const state = findSubscription(bookSubscriptions, { channel: 'book', prec: 'R0', len: '50', someField: true }, true)

  t.alike(state, bookSubscriptions[1])
})
