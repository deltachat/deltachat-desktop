import { useCallback } from 'react'

import ViewProfile from '../../components/dialogs/ViewProfile'
import useDialog from './useDialog'
import { BackendRemote } from '../../backend-com'

export default function useOpenViewProfileDialog(props?: {
  onAction?: () => void
}) {
  const { openDialog } = useDialog()

  return useCallback(
    async (accountId: number, contactId: number) => {
      const contact = await BackendRemote.rpc.getContact(accountId, contactId)
      openDialog(ViewProfile, { contact, onAction: props?.onAction })
    },
    [openDialog, props?.onAction]
  )
}
