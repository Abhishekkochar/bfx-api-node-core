'use strict'

const test = require('brittle')
const pendingUnsubDataCount = require('../../../../lib/ws2/channels/pending_unsub_data_count')

test('ws2:channels:pending_unsub_data_count - returns the number of pending data unsubscriptions', (t) => {
  const count = pendingUnsubDataCount({
    pendingUnsubscriptions: [42, 41],
    channels: {
      0: { channel: 'auth' },
      42: { channel: 'ticker' },
      41: { channel: 'random' }
    }
  })

  t.is(count, 1)
})
