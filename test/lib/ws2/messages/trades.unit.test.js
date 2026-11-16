'use strict'

const test = require('brittle')
const onTradesMessage = require('../../../../lib/ws2/messages/trades')
const { Trade, PublicTrade } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => { }
}

const channel = {
  symbol: 'tBTCUSD',
  pair: 'BTCUSD'
}

test('ws2:messages:trades - emits no data for heartbeats', (t) => {
  let emittedEvent = null

  onTradesMessage({
    msg: [15, 'hb'],
    state: {
      ...defaultState,
      emit: (eventName) => {
        emittedEvent = eventName
      }
    }
  })

  t.is(emittedEvent, null, 'should not have emitted any event')
})

test('ws2:messages:trades - emits raw data if not transforming', (t) => {
  t.plan(4)

  const tradeMessage = [25, [[12, Date.now(), 1525.2523, 1214.2]]]

  onTradesMessage({
    channel,
    msg: tradeMessage,
    payload: tradeMessage[1],
    state: {
      ...defaultState,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:trades') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, tradeMessage)
          t.alike(original, tradeMessage[1])
          t.alike(requested, tradeMessage[1])
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:trades - emits transformed account trades if necessary', (t) => {
  t.plan(4)

  const tradeMessage = [0, [[
    12, 'tBTCUSD', Date.now(), 23523, 1241.12, 12.42, 'LIMIT', 12.42, 1, 0.124, 'USD'
  ]]]

  onTradesMessage({
    channel,
    msg: tradeMessage,
    payload: tradeMessage[1],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:trades') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, tradeMessage)
          t.alike(original, tradeMessage[1])
          t.ok(requested instanceof Trade)
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:trades - emits transformed public trades if necessary', (t) => {
  t.plan(4)

  const tradeMessage = [25, [[12, Date.now(), 1525.2523, 1214.2]]]

  onTradesMessage({
    channel,
    msg: tradeMessage,
    payload: tradeMessage[1],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:trades') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, tradeMessage)
          t.alike(original, tradeMessage[1])
          t.ok(requested instanceof PublicTrade)
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})
