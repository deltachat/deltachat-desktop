/**
 * Sets up a minimal browser-like global environment plus a fake `Runtime`
 * so that frontend app modules can be imported and exercised
 * in plain Node unit tests (mocha + ts-node, see `bin/test-loader.mjs`).
 *
 * IMPORTANT: this module must be the FIRST import of any test file that
 * (transitively) imports app modules, because `runtime` is read from
 * `window.r` at module load time (see packages/runtime/runtime.ts).
 */
import { BaseDeltaChat } from '@deltachat/jsonrpc-client'
import { setLogHandler } from '@deltachat-desktop/shared/logger.js'

const g = globalThis as any

// without a handler the logger throws on the first `log.info()` etc.
setLogHandler(() => {}, {} as any)

/* ------------------------------------------------------------------ *
 * fake DOM / window globals
 * ------------------------------------------------------------------ */

/**
 * What `document.querySelector('#message-list')` returns; used by
 * `ChatViewReducer` to record scroll positions. Mutate as needed in tests.
 */
export const fakeMessageListElement = {
  scrollHeight: 1000,
  scrollTop: 50,
}

g.window = globalThis
g.document = {
  querySelector: (selector: string) =>
    selector === '#message-list' ? fakeMessageListElement : null,
  hasFocus: () => true,
  createElement: (_tag: string) => ({
    src: '',
    volume: 1,
    currentTime: 0,
    play: () => {},
    pause: () => {},
  }),
}

g.static_translate = (key: string) => key

/** For app code that uses `selectedAccountId()` from ScreenController. */
export function setSelectedAccountId(accountId: number | undefined) {
  g.__selectedAccountId = accountId
}

/* ------------------------------------------------------------------ *
 * fake JSON-RPC connection (BackendRemote)
 * ------------------------------------------------------------------ */

const rpcStubs = new Map<string, (...params: any[]) => any>()
const rpcCalls: { method: string; params: any[] }[] = []

// The generated RawClient sends snake_case method names over the wire;
// stubs and assertions use the camelCase names known from app code.
const snakeToCamelCase = (method: string) =>
  method.replace(/_([a-z0-9])/g, (_match, char) => char.toUpperCase())

const fakeTransport = {
  request: (method: string, params: any[]) => {
    const name = snakeToCamelCase(method)
    rpcCalls.push({ method: name, params })
    const stub = rpcStubs.get(name)
    if (!stub) {
      return Promise.reject(
        new Error(
          `No stub for RPC method "${name}". Register one with stubRpc('${name}', impl).`
        )
      )
    }
    return Promise.resolve(stub(...params))
  },
}

/** The instance that app code sees as `BackendRemote`. */
export const fakeDeltaChat = new BaseDeltaChat<any>(fakeTransport as any, false)

/**
 * Answers all future calls of the given (camelCase) RPC method.
 * Unstubbed methods reject, so tests fail loudly on unexpected calls.
 */
export function stubRpc(
  method: string,
  implementation: (...params: any[]) => any
) {
  rpcStubs.set(method, implementation)
}

/** All recorded calls (their params) of the given camelCase RPC method. */
export function getRpcCalls(method: string): any[][] {
  return rpcCalls
    .filter(call => call.method === method)
    .map(call => call.params)
}

/**
 * Emitter for simulating core events for an account, e.g.
 * `getFakeContextEvents(accountId).emit('IncomingMsg', { chatId, msgId })`.
 * This is the same emitter that `onDCEvent` subscribes to.
 */
export function getFakeContextEvents(accountId: number) {
  return fakeDeltaChat.getContextEvents(accountId)
}

/* ------------------------------------------------------------------ *
 * fake Runtime (window.r)
 * ------------------------------------------------------------------ */

const runtimeImpl: { [method: string]: any } = {
  createDeltaChatConnection: () => fakeDeltaChat,
  getRuntimeInfo: () => ({
    target: 'browser',
    isMac: false,
    isAppx: false,
    versions: [],
    runningUnderARM64Translation: false,
    rpcServerPath: '',
    buildInfo: { VERSION: '0.0.0-test', GIT_REF: 'test', BUILD_TIMESTAMP: 0 },
    isContentProtectionSupported: false,
  }),
}

// Everything not implemented above throws a descriptive error when called,
// so tests fail loudly instead of silently misbehaving.
g.r = new Proxy(runtimeImpl, {
  get(target, prop) {
    if (typeof prop !== 'string' || prop === 'then') {
      return undefined
    }
    if (prop in target) {
      return target[prop]
    }
    return (..._args: any[]) => {
      throw new Error(
        `fake Runtime: "${prop}" is not implemented in test-env.ts`
      )
    }
  },
})

/* ------------------------------------------------------------------ *
 * misc helpers
 * ------------------------------------------------------------------ */

/** Waits for one macrotask, letting `setTimeout(..., 0)` callbacks run. */
export const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

/** Call in `beforeEach` to get a clean slate. */
export function resetTestEnv() {
  rpcStubs.clear()
  rpcCalls.length = 0
  fakeMessageListElement.scrollHeight = 1000
  fakeMessageListElement.scrollTop = 50
  g.__selectedAccountId = undefined
  g.__internal_jump_to_message_asap = undefined
}
