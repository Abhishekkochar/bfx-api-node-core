'use strict'

const test = require('brittle')
const getAuthParams = require('../../../lib/util/get_auth_params')

test('utils:get_auth_params - prioritizes authToken over apiKey and apiSecret', (t) => {
  const authArgs = {
    apiKey: 'key',
    apiSecret: 'secret',
    authToken: 'token',
    dms: 4,
    calc: 0
  }

  const res = getAuthParams.get(authArgs)

  t.is(res.event, 'auth')
  t.is(res.dms, authArgs.dms)
  t.is(res.calc, authArgs.calc)
  t.is(res.token, authArgs.authToken)
  t.alike(Object.keys(res), ['event', 'dms', 'calc', 'token'])
})

test('utils:get_auth_params - returns params with apiKey and apiSecret when authToken is not provided', (t) => {
  const authArgs = {
    apiKey: 'key',
    apiSecret: 'secret',
    authToken: '',
    dms: 4,
    calc: 0
  }

  const res = getAuthParams.get(authArgs)

  t.is(res.event, 'auth')
  t.is(res.dms, authArgs.dms)
  t.is(res.calc, authArgs.calc)
  t.is(res.apiKey, authArgs.apiKey)
  t.alike(Object.keys(res), ['event', 'dms', 'calc', 'apiKey', 'authSig', 'authPayload', 'authNonce'])
})
