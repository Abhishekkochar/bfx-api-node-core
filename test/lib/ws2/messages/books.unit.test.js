'use strict'

const test = require('brittle')
const onBooksMessage = require('../../../../lib/ws2/messages/books')
const { OrderBook } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => { }
}

const channel = {
  symbol: 'tBTCUSD',
  prec: 'P0',
  len: '25'
}

test('ws2:messages:books - emits checksum event for checksums', (t) => {
  t.plan(4)

  const csMessage = [23, 'cs', 2352666]

  onBooksMessage({
    channel,
    msg: csMessage,
    state: {
      ...defaultState,
      emit: (eventName, packet = {}) => {
        const { msg, original, requested, chanFilter } = packet

        if (eventName === 'data:book:cs') {
          t.alike(msg, csMessage)
          t.is(original, csMessage[2])
          t.is(requested, csMessage[2])
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:books - emits no event for heartbeats', (t) => {
  let emittedEvent = null

  onBooksMessage({
    channel,
    msg: [25, 'hb'],
    state: {
      ...defaultState,
      emit: (eventName) => {
        emittedEvent = eventName
      }
    }
  })

  t.is(emittedEvent, null, 'should not have emitted any event')
})

test('ws2:messages:books - emits data:book event with raw data if not transforming', (t) => {
  t.plan(4)

  const bookMessage = [25, [[235.2532, 2, 12]]]

  onBooksMessage({
    channel,
    msg: bookMessage,
    payload: bookMessage[1],
    state: {
      ...defaultState,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:book') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, bookMessage)
          t.alike(original, bookMessage[1])
          t.alike(requested, bookMessage[1])
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:books - emits data:book event with transformed data if necessary', (t) => {
  t.plan(5)

  const bookMessage = [25, [[235.2532, 2, 12]]]

  onBooksMessage({
    channel,
    msg: bookMessage,
    payload: bookMessage[1],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:book') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, bookMessage)
          t.alike(original, bookMessage[1])
          t.ok(requested instanceof OrderBook)
          t.alike(requested.bids, bookMessage[1])
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})
