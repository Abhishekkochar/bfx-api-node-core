'use strict'

const test = require('brittle')
const onErrorEvent = require('../../../../lib/ws2/events/error')

const defaultState = {
  emit: () => { }
}

test('ws2:events:error - emits error event', (t) => {
  t.plan(1)

  const err = new Error()

  onErrorEvent({
    ...defaultState,
    emit: (eventName, error) => {
      if (eventName === 'event:error') {
        t.is(error, err)
      }
    }
  }, err)
})

test('ws2:events:error - emits generic error event', (t) => {
  t.plan(1)

  const err = new Error()

  onErrorEvent({
    ...defaultState,
    emit: (eventName, error) => {
      if (eventName === 'error') {
        t.is(error, err)
      }
    }
  }, err)
})
