import { useCallback } from 'react'

import ViewProfile from '../components/dialogs/ViewProfile'
import { BackendRemote } from '../backend-com'
import useDialog from './useDialog'

export default function useOpenViewProfileDialog() {
  const { openDialog } = useDialog()

  return useCallback(
    async (accountId: number, contactId: number) => {
      const contact = await BackendRemote.rpc.getContact(accountId, contactId)
      openDialog(ViewProfile, { contact })
    },
    [openDialog]
  )
}
