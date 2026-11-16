'use strict'

const test = require('brittle')
const onNotificationMessage = require('../../../../lib/ws2/messages/notifications')
const { Notification } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => { }
}

const channel = {
  chanId: 0
}

test('ws2:messages:notifications - emits raw data if not transforming', (t) => {
  t.plan(3)

  const nMessage = [0, 'n', [Date.now(), 'info', 23, null, {}, 0, 'SUCCESS', '']]

  onNotificationMessage({
    channel,
    msg: nMessage,
    payload: nMessage[2],
    state: {
      ...defaultState,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:notification') {
          const { msg, original, requested } = packet
          t.alike(msg, nMessage)
          t.alike(original, nMessage[2])
          t.alike(requested, nMessage[2])
        }
      }
    }
  })
})

test('ws2:messages:notifications - emits transformed notifications if necessary', (t) => {
  t.plan(3)

  const nMessage = [0, 'n', [Date.now(), 'info', 23, null, {}, 0, 'SUCCESS', '']]

  onNotificationMessage({
    channel,
    msg: nMessage,
    payload: nMessage[2],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = {}) => {
        if (eventName === 'data:notification') {
          const { msg, original, requested } = packet
          t.alike(msg, nMessage)
          t.alike(original, nMessage[2])
          t.ok(requested instanceof Notification)
        }
      }
    }
  })
})

test('ws2:messages:notifications - emits order close events', (t) => {
  t.plan(2)

  const nMessage = [0, 'n', [Date.now(), 'oc-req', 23, null, [
    42 // no need to mock the other order fields
  ], 0, 'SUCCESS', '']]

  onNotificationMessage({
    channel,
    msg: nMessage,
    payload: nMessage[2],
    state: {
      ...defaultState,
      emit: (eventName, data, payload) => {
        if (eventName === 'n:oc-req:42:success') {
          t.alike(data, [42])
          t.alike(payload, [42])
        }
      }
    }
  })
})

test('ws2:messages:notifications - emits order update events', (t) => {
  t.plan(2)

  const nMessage = [0, 'n', [Date.now(), 'ou-req', 23, null, [
    42 // no need to mock the other order fields
  ], 0, 'SUCCESS', '']]

  onNotificationMessage({
    channel,
    msg: nMessage,
    payload: nMessage[2],
    state: {
      ...defaultState,
      emit: (eventName, data, payload) => {
        if (eventName === 'n:ou-req:42:success') {
          t.alike(data, [42])
          t.alike(payload, [42])
        }
      }
    }
  })
})

test('ws2:messages:notifications - emits new order events', (t) => {
  t.plan(2)

  const nMessage = [0, 'n', [Date.now(), 'on-req', 23, null, [
    0, 235, 42 // NOTE: filters by cid, since ID cannot be known before
  ], 0, 'SUCCESS', '']]

  onNotificationMessage({
    channel,
    msg: nMessage,
    payload: nMessage[2],
    state: {
      ...defaultState,
      emit: (eventName, data, payload) => {
        if (eventName === 'n:on-req:42:success') {
          t.alike(data, [0, 235, 42])
          t.alike(payload, [0, 235, 42])
        }
      }
    }
  })
})
