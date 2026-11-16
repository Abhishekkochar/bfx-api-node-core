'use strict'

const test = require('brittle')
const isFlagEnabled = require('../../../../lib/ws2/flags/is_enabled')
const Config = require('../../../../lib/config')

const state = {
  flags: Config.FLAGS.SEQ_ALL + Config.FLAGS.OB_CHECKSUM
}

test('ws2:flags:is-enabled - correctly detects flags', (t) => {
  t.ok(isFlagEnabled(state, Config.FLAGS.SEQ_ALL))
  t.ok(isFlagEnabled(state, Config.FLAGS.OB_CHECKSUM))
  t.absent(isFlagEnabled(state, Config.FLAGS.TIME_S))
})
