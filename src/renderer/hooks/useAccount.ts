import { useAtomValue, useSetAtom } from 'jotai'

import * as atoms from '../atoms/account'

export default function useAccount() {
  const selectedAccountId = useAtomValue(atoms.selectedAccountId)
  const selectAccount = useSetAtom(atoms.selectAccount)
  const unselectAccount = useSetAtom(atoms.unselectAccount)

  return {
    selectedAccountId,
    selectAccount: async (accountId: number) => {
      await selectAccount(accountId)
    },
    unselectAccount: async () => {
      await unselectAccount()
    },
  }
}
