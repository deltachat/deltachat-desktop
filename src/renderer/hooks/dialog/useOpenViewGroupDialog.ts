import { useCallback } from 'react'

import useDialog from './useDialog'
import ViewGroup from '../../components/dialogs/ViewGroup'

import type { T } from '@deltachat/jsonrpc-client'

export default function useOpenViewGroupDialog() {
  const { openDialog } = useDialog()

  return useCallback(
    (chat: T.FullChat) => {
      openDialog(ViewGroup, {
        chat,
      })
    },
    [openDialog]
  )
}
