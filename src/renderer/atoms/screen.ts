import { atom, useSetAtom } from 'jotai'
import { atomEffect } from 'jotai-effect'

import { selectedAccountId } from './account'
import * as accountBackend from '../backend/account'

export enum Screens {
  Welcome,
  Main,
  Login,
  Loading,
  DeleteAccount,
  NoAccountSelected,
}

const screen = atom<Screens>(Screens.Loading)

export const currentScreen = atom(get => get(screen))

export const changeScreen = atom(null, (_get, set, nextScreen: Screens) => {
  set(screen, nextScreen)
})

export const redirectWhenUnconfigured = atomEffect(get => {
  const accountId = get(selectedAccountId)
  if (accountId === null) {
    return
  }

  const set = useSetAtom(changeScreen)
  const effect = async () => {
    const account = await accountBackend.getAccountInfo(accountId)
    if (account.kind === 'Configured') {
      set(Screens.Main)
    } else {
      set(Screens.Welcome)
    }
  }

  effect()
})
