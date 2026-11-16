'use strict'

const test = require('brittle')
const setFlag = require('../../../../lib/ws2/flags/set')

const defaultState = {
  isOpen: true,
  ws: {
    send: () => { }
  },
  ev: {
    emit: () => { }
  }
}

test('ws2:flags:set - sends conf packet', (t) => {
  t.plan(1)

  const flags = 42

  setFlag({
    ...defaultState,
    ws: {
      send: (json) => {
        const packet = JSON.parse(json)

        t.alike(packet, {
          event: 'conf',
          flags
        })
      }
    }
  }, flags)
})

test('ws2:flags:set - updates flags on state', (t) => {
  const nextState = setFlag({ ...defaultState }, 42)
  t.is(nextState.flags, 42)
})

test('ws2:flags:set - emits flag update event', (t) => {
  t.plan(1)

  setFlag({
    ...defaultState,
    ev: {
      emit: (eventName, data) => {
        if (eventName === 'exec:flags:set') {
          t.is(data, 42)
        }
      }
    }
  }, 42)
})

test('ws2:flags:set - does not emit flag update event if silent is passed', (t) => {
  let emitted = false

  setFlag({
    ...defaultState,
    ev: {
      emit: (eventName) => {
        if (eventName === 'exec:flags:set') {
          emitted = true
        }
      }
    }
  }, 42, true)

  t.absent(emitted, 'flag event should not have been emitted')
})
