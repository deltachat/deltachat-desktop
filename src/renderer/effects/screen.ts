import { atomEffect } from 'jotai-effect'
import { useSetAtom } from 'jotai'

import * as accountBackend from '../backend/account'
import { Screens, changeScreen } from '../atoms/screen'
import { selectedAccountId } from '../atoms/account'

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
