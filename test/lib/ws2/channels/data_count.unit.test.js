'use strict'

const test = require('brittle')
const dataCount = require('../../../../lib/ws2/channels/data_count')

test('ws2:channels:data_count - returns the number of subscriptions plus pending subs, minus pending unsubs', (t) => {
  const countA = dataCount({
    pendingSubscriptions: [{ channel: 'ticker', symbol: 'tBTCUSD' }],
    pendingUnsubscriptions: [42],
    channels: {
      0: { channel: 'auth' },
      42: { channel: 'ticker' }
    }
  })

  const countB = dataCount({
    pendingSubscriptions: [{ channel: 'ticker', symbol: 'tBTCUSD' }],
    pendingUnsubscriptions: [],
    channels: {
      0: { channel: 'auth' },
      42: { channel: 'ticker' }
    }
  })

  const countC = dataCount({
    pendingSubscriptions: [],
    pendingUnsubscriptions: [],
    channels: {
      0: { channel: 'auth' },
      42: { channel: 'ticker' },
      52: { channel: 'candles' }
    }
  })

  t.is(countA, 1)
  t.is(countB, 2)
  t.is(countC, 2)
})
