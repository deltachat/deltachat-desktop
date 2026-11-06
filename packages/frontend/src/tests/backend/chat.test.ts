// test-env must be the first import, see its header.
import { getRpcCalls, resetTestEnv, stubRpc } from '../helpers/test-env.js'

import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'

import { getLastChatId, saveLastChatId } from '../../backend/chat.js'

/** The known value lives in the module, so every test uses its own account. */
let nextAccountId = 1

function writtenValues(accountId: number): string[] {
  return getRpcCalls('setConfig')
    .filter(([id]: any[]) => id === accountId)
    .map(([, , value]: any[]) => value)
}

describe('saveLastChatId', () => {
  let accountId: number

  beforeEach(() => {
    resetTestEnv()
    accountId = nextAccountId++
    stubRpc('setConfig', async () => null)
  })

  it('writes a new value', async () => {
    await saveLastChatId(accountId, 10)
    expect(writtenValues(accountId)).to.deep.equal(['10'])
  })

  it('skips a value that is already saved', async () => {
    await saveLastChatId(accountId, 10)
    await saveLastChatId(accountId, 10)
    expect(writtenValues(accountId)).to.deep.equal(['10'])
  })

  it('skips the value it read', async () => {
    stubRpc('getConfig', async () => '10')
    await getLastChatId(accountId)
    await saveLastChatId(accountId, 10)
    expect(writtenValues(accountId)).to.deep.equal([])
  })

  it('keeps the latest selection when going back during a write', async () => {
    await saveLastChatId(accountId, 10)

    await Promise.all([
      saveLastChatId(accountId, 11),
      saveLastChatId(accountId, 10),
    ])

    expect(writtenValues(accountId)).to.deep.equal(['10', '11', '10'])
  })

  it('writes one after the other', async () => {
    let finishFirst = () => {}
    stubRpc(
      'setConfig',
      () => new Promise<null>(resolve => (finishFirst = () => resolve(null)))
    )

    const first = saveLastChatId(accountId, 10)
    const second = saveLastChatId(accountId, 11)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(writtenValues(accountId)).to.deep.equal(['10'])

    stubRpc('setConfig', async () => null)
    finishFirst()
    await Promise.all([first, second])
    expect(writtenValues(accountId)).to.deep.equal(['10', '11'])
  })

  it('writes again after a failed save', async () => {
    stubRpc('setConfig', async () => {
      throw new Error('failed')
    })
    let error: unknown
    await saveLastChatId(accountId, 10).catch(e => (error = e))
    expect(error).to.be.instanceOf(Error)

    stubRpc('setConfig', async () => null)
    await saveLastChatId(accountId, 10)
    expect(writtenValues(accountId)).to.deep.equal(['10', '10'])
  })

  it('waits for pending saves before reading', async () => {
    let saved = false
    stubRpc('setConfig', async () => {
      await new Promise(resolve => setTimeout(resolve, 5))
      saved = true
      return null
    })
    stubRpc('getConfig', async () => (saved ? '10' : '9'))

    const save = saveLastChatId(accountId, 10)
    expect(await getLastChatId(accountId)).to.equal(10)
    await save
  })
})
