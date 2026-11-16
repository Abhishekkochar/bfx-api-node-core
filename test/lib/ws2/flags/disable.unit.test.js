'use strict'

const test = require('brittle')
const disableFlag = require('../../../../lib/ws2/flags/disable')

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

test('ws2:flags:disable - sets flags to new flag set after removing single flag', (t) => {
  const nextState = disableFlag({
    ...defaultState,
    flags: 42
  }, 42, true)

  t.is(nextState.flags, 0)
})
