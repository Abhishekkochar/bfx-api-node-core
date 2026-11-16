'use strict'

const test = require('brittle')
const onTickersMessage = require('../../../../lib/ws2/messages/tickers')
const { TradingTicker, FundingTicker } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => { }
}

const channel = {
  symbol: 'tBTCUSD',
  pair: 'BTCUSD'
}

test('ws2:messages:tickers - emits no data for heartbeats', (t) => {
  let emittedEvent = null

  onTickersMessage({
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

test('ws2:messages:tickers - emits raw data if not transforming', (t) => {
  t.plan(4)

  const tickerMessage = [25, [['tBTCUSD', 51, 12523, 12, 124632, 2352, 0.235, 124, 124152, 12, 9]]]

  onTickersMessage({
    channel,
    msg: tickerMessage,
    payload: tickerMessage[1],
    state: {
      ...defaultState,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:ticker') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, tickerMessage)
          t.alike(original, tickerMessage[1])
          t.alike(requested, tickerMessage[1])
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:tickers - emits transformed trading ticker if necessary', (t) => {
  t.plan(4)

  const tickerMessage = [25, [['tBTCUSD', 51, 12523, 12, 124632, 2352, 0.235, 124, 124152, 12, 9]]]

  onTickersMessage({
    channel,
    msg: tickerMessage,
    payload: tickerMessage[1],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:ticker') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, tickerMessage)
          t.alike(original, tickerMessage[1])
          t.ok(requested instanceof TradingTicker)
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:tickers - emits transformed funding ticker if necessary', (t) => {
  t.plan(4)

  const tickerMessage = [25, [['tBTCUSD', 51, 12523, 12, 124632, 2352, 0.235, 124, 124152, 12, 9]]]
  const fundingChannel = {
    symbol: 'fUSD',
    pair: 'USD'
  }

  onTickersMessage({
    channel: fundingChannel,
    msg: tickerMessage,
    payload: tickerMessage[1],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:ticker') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, tickerMessage)
          t.alike(original, tickerMessage[1])
          t.ok(requested instanceof FundingTicker)
          t.alike(chanFilter, fundingChannel)
        }
      }
    }
  })
})
