'use strict'

const test = require('brittle')
const onCandlesMessage = require('../../../../lib/ws2/messages/candles')
const _isObject = require('lodash/isObject')

const defaultState = {
  transform: false,
  emit: () => { }
}

const channel = {
  key: 'trade:tBTCUSD:5m'
}

test('ws2:messages:candles - emits no data for heartbeats', (t) => {
  let emittedEvent = null

  onCandlesMessage({
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

test('ws2:messages:candles - emits raw data if not transforming', (t) => {
  t.plan(4)

  const candleMessage = [25, [[Date.now(), 214, 235, 256, 195, 232552]]]

  onCandlesMessage({
    channel,
    msg: candleMessage,
    payload: candleMessage[1],
    state: {
      ...defaultState,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:candles') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, candleMessage)
          t.alike(original, candleMessage[1])
          t.alike(requested, candleMessage[1])
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})

test('ws2:messages:candles - emits transformed candles if necessary', (t) => {
  t.plan(4)

  const candleMessage = [25, [[Date.now(), 214, 235, 256, 195, 232552]]]

  onCandlesMessage({
    channel,
    msg: candleMessage,
    payload: candleMessage[1],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:candles') {
          const { msg, original, requested, chanFilter } = packet
          t.alike(msg, candleMessage)
          t.alike(original, candleMessage[1])
          t.ok(_isObject(requested))
          t.alike(chanFilter, channel)
        }
      }
    }
  })
})
