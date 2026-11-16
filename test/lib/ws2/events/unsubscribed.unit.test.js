'use strict'

const test = require('brittle')
const onUnsubscribedEvent = require('../../../../lib/ws2/events/unsubscribed')

const defaultState = {
  pendingUnsubscriptions: [],
  channels: {},
  emit: () => { }
}

test('ws2:events:unsubscribed - emits unsubscribed event', (t) => {
  t.plan(1)

  const packet = { chanId: -1 }

  onUnsubscribedEvent({
    ...defaultState,
    emit: (eventName, data) => {
      if (eventName === 'event:unsubscribed') {
        t.alike(data, packet)
      }
    }
  }, packet)
})

test('ws2:events:unsubscribed - removes channel from state pending unsubs list', (t) => {
  const packet = { chanId: 42 }
  const nextState = onUnsubscribedEvent({
    ...defaultState,
    pendingUnsubscriptions: [40, 41, 42]
  }, packet)

  t.alike(nextState.pendingUnsubscriptions, [40, 41])
})

test('ws2:events:unsubscribed - removes channel from state channel map', (t) => {
  const packet = { chanId: 42 }
  const nextState = onUnsubscribedEvent({
    ...defaultState,
    channels: {
      42: {
        channel: 'trades',
        symbol: 'tBTCUSD'
      }
    }
  }, packet)

  t.alike(nextState.channels, {})
})
