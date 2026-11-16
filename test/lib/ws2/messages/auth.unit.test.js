'use strict'

const test = require('brittle')
const onAuthMessage = require('../../../../lib/ws2/messages/auth')
const { Position } = require('bfx-api-node-models')

const defaultState = {
  transform: false,
  emit: () => { }
}

test('ws2:messages:auth - forwards notifications to notifications handler', (t) => {
  t.plan(1)

  onAuthMessage({
    msg: [0, 'n', []],
    state: {
      ...defaultState,
      emit: (eventName, data = {}) => {
        const { original } = data

        if (eventName === 'data:notification') {
          t.alike(original, [])
        }
      }
    }
  })
})

test('ws2:messages:auth - throws error if transform is true and data type is unknown', (t) => {
  t.exception(() => {
    onAuthMessage({
      msg: [32, 'unknown', []],
      state: {
        ...defaultState,
        transform: true
      }
    })
  })
})

test('ws2:messages:auth - emits data:auth event with raw data', (t) => {
  t.plan(4)

  onAuthMessage({
    msg: [0, 'ps', [42]],
    state: {
      ...defaultState,
      emit: (eventName, packet = []) => {
        if (eventName === 'data:auth') {
          const [chanId, type, data, transformed] = packet
          t.is(chanId, 0)
          t.is(type, 'ps')
          t.alike(data, [42])
          t.ok(transformed instanceof Position)
        }
      }
    }
  })
})

test('ws2:messages:auth - emits data:auth event with transformed data if necessary', (t) => {
  t.plan(4)

  onAuthMessage({
    msg: [0, 'ps', [42]],
    state: {
      ...defaultState,
      transform: true,
      emit: (eventName, packet = []) => {
        if (eventName === 'data:auth') {
          const [chanId, type, data, transformed] = packet
          t.is(chanId, 0)
          t.is(type, 'ps')
          t.ok(data instanceof Position)
          t.ok(transformed instanceof Position)
        }
      }
    }
  })
})
