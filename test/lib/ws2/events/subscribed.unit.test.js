'use strict'

const test = require('brittle')
const onSubscribedEvent = require('../../../../lib/ws2/events/subscribed')

const defaultState = {
  pendingSubscriptions: [],
  channels: {},
  emit: () => { }
}

test('ws2:events:subscribed - emits subscribed event', (t) => {
  t.plan(1)

  const packet = { chanId: -1 }

  onSubscribedEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'event:subscribed') {
        t.alike(data, packet)
      }
    }
  }, packet)
})

test('ws2:events:subscribed - removes pending subscription from state', (t) => {
  const packet = {
    chanId: 52,
    channel: 'trades',
    symbol: 'tBTCUSD'
  }

  const nextState = onSubscribedEvent({
    ...defaultState,
    pendingSubscriptions: [
      {
        channel: 'book',
        prec: 'R0',
        len: '25'
      },
      {
        channel: 'trades',
        symbol: 'tBTCUSD'
      }
    ]
  }, packet)

  t.alike(nextState.pendingSubscriptions, [{
    channel: 'book',
    prec: 'R0',
    len: '25'
  }])
})

test('ws2:events:subscribed - creates channel in state channel map', (t) => {
  const packet = {
    chanId: 52,
    channel: 'trades',
    symbol: 'tBTCUSD'
  }

  const nextState = onSubscribedEvent({ ...defaultState }, packet)

  t.alike(nextState.channels[52], packet)
})
