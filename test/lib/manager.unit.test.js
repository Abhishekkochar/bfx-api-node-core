'use strict'

const test = require('brittle')
const { createSandbox } = require('sinon')
const proxyquire = require('proxyquire')
const EventEmitter = require('events')
const WebSocket = require('ws')
const { setTimeout: delay } = require('timers/promises')

const WSManager = require('../../lib/manager')
const { genAuthSig } = require('bfx-api-node-util')
const { MockWSv2Server } = require('bfx-api-mock-srv')

const sandbox = createSandbox()
const WsStateConstructorStub = sandbox.stub()
const authWsStub = sandbox.stub()

const Manager = proxyquire('../../lib/manager', {
  './ws2/auth': authWsStub,
  './ws2/init_state': sandbox.spy((opts) => {
    const id = WsStateConstructorStub(opts)

    return {
      id,
      ev: new EventEmitter(),
      ws: {
        readyState: WebSocket.OPEN,
        close: sandbox.stub()
      }
    }
  })
})

const API_KEY = 'api key'
const API_SECRET = 'api secret'
const AUTH_TOKEN = 'auth token'

const args = {
  apiKey: 'api key',
  apiSecret: 'api secret',
  authToken: 'auth token',
  transform: 'transform',
  agent: false,
  wsURL: 'ws url',
  calc: 'calc',
  dms: 'dms'
}

// replaces Mocha's afterEach(() => sandbox.reset())
const resetSandboxAfter = (t) => t.teardown(() => sandbox.reset())

test('manager:openWS - open ws and notify plugins', (t) => {
  resetSandboxAfter(t)

  const wsId = 'ws id'
  WsStateConstructorStub.returns(wsId)
  const notifyPluginsStub = sandbox.stub()

  const instance = new Manager(args)
  instance.notifyPlugins = notifyPluginsStub
  const { ev, id } = instance.openWS()
  t.teardown(() => ev.removeAllListeners())

  t.is(id, wsId)
  t.alike(ev.eventNames(), [
    'self:open',
    'self:reopen',
    'self:message',
    'self:close',
    'self:error',
    'error',
    'data:notification',
    'data:ticker',
    'data:trades',
    'data:candles',
    'data:book',
    'data:managed:book',
    'data:managed:candles',
    'data:book:cs',
    'data:auth',
    'event:auth',
    'event:auth:success',
    'event:auth:error',
    'event:subscribed',
    'event:unsubscribed',
    'event:config',
    'event:error',
    'event:info',
    'event:info:server-restart',
    'event:info:maintenance-start',
    'event:info:maintenance-end',
    'event:pong',
    'plugin:event',
    'exec:order:submit',
    'exec:order:update',
    'exec:order:cancel',
    'exec:order:cancel-by-gid',
    'exec:flags:set',
    'exec:ping'
  ])
  t.ok(
    notifyPluginsStub.calledWithExactly('ws2', 'manager', 'ws:created', { id: wsId }),
    'notifies plugins of ws:created'
  )
})

test('manager:closeAllSockets - close all sockets and notify plugins', (t) => {
  resetSandboxAfter(t)

  const wsId = 'ws id'
  WsStateConstructorStub.returns(wsId)
  const notifyPluginsStub = sandbox.stub()

  const instance = new Manager(args)
  instance.notifyPlugins = notifyPluginsStub
  const { ev, id, ws } = instance.openWS()
  t.teardown(() => ev.removeAllListeners())

  instance.closeWS(id)

  t.is(id, wsId)
  t.ok(
    notifyPluginsStub.calledWithExactly('ws2', 'manager', 'ws:destroyed', { id: wsId }),
    'notifies plugins of ws:destroyed'
  )
  t.is(ws.close.callCount, 1, 'closes the socket once')
  t.alike(instance.wsPool, [])
})

test('manager:notifyPlugins - notify plugins that match type', (t) => {
  resetSandboxAfter(t)

  const notifyPluginStub = sandbox.stub()

  const type = 'notification type'
  const section = 'notification section'
  const name = 'notification name'
  const args = { id: 'id' }

  const pluginThatMatches = {
    id: 'plugin 1',
    type
  }
  const pluginDoesNoMatch = {
    id: 'plugin 2',
    type: 'another type'
  }

  const instance = new Manager({
    plugins: [
      pluginThatMatches,
      pluginDoesNoMatch
    ]
  })
  instance.notifyPlugin = notifyPluginStub
  instance.notifyPlugins(type, section, name, args)

  t.is(notifyPluginStub.callCount, 1)
  t.ok(notifyPluginStub.calledWithExactly(pluginThatMatches, section, name, args))
  t.absent(notifyPluginStub.calledWith(pluginDoesNoMatch))
})

test('manager:notifyPlugins - wildcard type should notify all plugins', (t) => {
  resetSandboxAfter(t)

  const notifyPluginStub = sandbox.stub()

  const type = '*'
  const section = 'notification section'
  const name = 'notification name'
  const args = { id: 'id' }

  const plugins = [
    {
      id: 'plugin 1',
      type: 'first type'
    },
    {
      id: 'plugin 2',
      type: 'another type'
    }
  ]

  const instance = new Manager({
    plugins
  })
  instance.notifyPlugin = notifyPluginStub
  instance.notifyPlugins(type, section, name, args)

  t.is(notifyPluginStub.callCount, 2)
  plugins.forEach((plugin, index) => {
    t.ok(notifyPluginStub.getCall(index).calledWithExactly(plugin, section, name, args))
  })
})

test('manager:notifyPlugin - notifies the plugin and updates the ws state', (t) => {
  resetSandboxAfter(t)

  const id = 'id'
  const section = 'manager'
  const name = 'event'
  const args = { id }

  const stub = sandbox.stub().returns({
    internalState: 'new value'
  })

  const plugin = {
    id: 'plugin id',
    type: 'ws2',
    [section]: {
      [name]: stub
    }
  }

  const ws = { internalState: 'value' }

  const instance = new Manager({
    plugins: [plugin]
  })
  instance.wsPool = [ws]
  instance.notifyPlugin(plugin, section, name, args)

  t.ok(stub.calledWithExactly({
    manager: instance,
    state: ws,
    id
  }))
  t.alike(instance.wsPool, [
    { internalState: 'new value' }
  ])
})

test('manager:notifyPlugin - notifies the plugin and updates both ws and plugin state', (t) => {
  resetSandboxAfter(t)

  const id = 'id'
  const section = 'manager'
  const name = 'event'
  const args = { id }

  const stub = sandbox.stub()

  const plugin = {
    id: 'plugin id',
    type: 'ws2',
    pluginInternalState: 'valeu',
    [section]: {
      [name]: stub
    }
  }

  const ws = {
    wsInternalState: 'value',
    plugins: {
      [plugin.id]: plugin
    }
  }

  stub.returns([
    {
      ...ws,
      wsInternalState: 'new value'
    },
    {
      pluginInternalState: 'new value'
    }
  ])

  const instance = new Manager({
    plugins: [plugin]
  })
  instance.wsPool = [ws]
  instance.notifyPlugin(plugin, section, name, args)

  t.ok(stub.calledWithExactly({
    manager: instance,
    state: ws,
    id
  }))
  t.is(instance.wsPool[0].wsInternalState, 'new value')
  t.is(plugin.pluginInternalState, 'new value')
})

// --- Reconnect all sockets ---

const createMockServer = () => new MockWSv2Server({
  syncOnConnect: false,
  authMiddleware: ({ apiKey, authSig, authPayload, token }) => {
    if (token) {
      return token === AUTH_TOKEN
    }

    const { sig } = genAuthSig(API_SECRET, authPayload)
    return apiKey === API_KEY && authSig === sig
  }
})

// replaces Mocha's afterEach cleanup for the reconnect tests
const cleanupAfter = (t, m, wss) => {
  t.teardown(async () => {
    try {
      m.closeAllSockets()
    } catch {
      // sockets may already be closed
    }

    if (wss.isOpen()) {
      await wss.close()
    }
  })
}

test('reconnect all sockets - reconnects properly when API credentials are updated', async (t) => {
  const wss = createMockServer()
  const m = new WSManager({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    wsURL: 'ws://localhost:9997'
  })
  cleanupAfter(t, m, wss)

  m.openWS()

  t.is(m.getWSByIndex(0).authArgs.apiKey, API_KEY)
  t.is(m.getWSByIndex(0).authArgs.apiSecret, API_SECRET)

  m.wsPool[0].managedClose = true // do not close wss on connection reopen

  await delay(50)
  t.is(m.getWSByIndex(0).authenticated, true)

  m.updateAuthArgs({ apiKey: 'invalid api key', apiSecret: 'invalid api secret' })

  t.is(m.getWSByIndex(0).authArgs.apiKey, 'invalid api key')
  t.is(m.getWSByIndex(0).authArgs.apiSecret, 'invalid api secret')

  m.reconnectAllSockets()

  await delay(50)
  t.is(m.getWSByIndex(0).authenticated, false)

  m.updateAuthArgs({ apiKey: API_KEY, apiSecret: API_SECRET })

  t.is(m.getWSByIndex(0).authArgs.apiKey, API_KEY)
  t.is(m.getWSByIndex(0).authArgs.apiSecret, API_SECRET)

  m.reconnectAllSockets()

  await delay(50)
  t.is(m.getWSByIndex(0).authenticated, true)
})

test('reconnect all sockets - reconnects properly when auth token is updated', async (t) => {
  const wss = createMockServer()
  const m = new WSManager({
    authToken: AUTH_TOKEN,
    wsURL: 'ws://localhost:9997'
  })
  cleanupAfter(t, m, wss)

  m.openWS()

  t.is(m.getWSByIndex(0).authArgs.authToken, AUTH_TOKEN)

  m.wsPool[0].managedClose = true // do not close wss on connection reopen

  await delay(50)
  t.is(m.getWSByIndex(0).authenticated, true)

  m.updateAuthArgs({ authToken: 'invalid auth token' })

  t.is(m.getWSByIndex(0).authArgs.authToken, 'invalid auth token')

  m.reconnectAllSockets()

  await delay(50)
  t.is(m.getWSByIndex(0).authenticated, false)

  m.updateAuthArgs({ authToken: AUTH_TOKEN })

  t.is(m.getWSByIndex(0).authArgs.authToken, AUTH_TOKEN)

  m.reconnectAllSockets()

  await delay(50)
  t.is(m.getWSByIndex(0).authenticated, true)
})
