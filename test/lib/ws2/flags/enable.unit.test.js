'use strict'

const test = require('brittle')
const enableFlag = require('../../../../lib/ws2/flags/enable')

const defaultState = {
  flags: 0,
  isOpen: true,
  ws: {
    send: () => { }
  },
  ev: {
    emit: () => { }
  }
}

test('ws2:flags:enable - sets flags to new flag set after adding single flag', (t) => {
  const nextState = enableFlag({ ...defaultState }, 42, true)
  t.is(nextState.flags, 42)
})
