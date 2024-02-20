import { atom } from 'jotai'

import * as backend from '../backend/account'

const accountId = atom<number | null>(null)

export const selectedAccountId = atom(get => get(accountId))

export const selectAccount = atom(
  null,
  async (get, set, nextAccountId: number) => {
    const currentId = get(accountId)
    if (currentId === nextAccountId) {
      return
    }

    if (currentId !== null) {
      await backend.unselectAccount(currentId)
    }

    await backend.selectAccount(nextAccountId)
    set(accountId, nextAccountId)
  }
)

export const unselectAccount = atom(null, async (get, set) => {
  const currentId = get(accountId)
  if (currentId === null) {
    return
  }

  await backend.unselectAccount(currentId)
  set(accountId, null)
})
