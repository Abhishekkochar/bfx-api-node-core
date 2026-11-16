'use strict'

const test = require('brittle')
const pendingSubDataCount = require('../../../../lib/ws2/channels/pending_sub_data_count')

test('ws2:channels:pending_sub_data_count - returns the number of pending data subscriptions', (t) => {
  const count = pendingSubDataCount({
    pendingSubscriptions: [
      { channel: 'ticker', symbol: 'tBTCUSD' },
      { channel: 'nope', symbol: 42 },
      { channel: 'trades', symbol: 'tBTCUSD' }
    ]
  })

  t.is(count, 2)
})
