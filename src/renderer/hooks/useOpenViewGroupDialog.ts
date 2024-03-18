import { useCallback } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import useDialog from './useDialog'
import ViewGroup from '../components/dialogs/ViewGroup'

import type { T } from '@deltachat/jsonrpc-client'

export default function useOpenViewGroupDialog() {
  const { openDialog } = useDialog()

  return useCallback(
    (chat: T.FullChat) => {
      openDialog(ViewGroup, {
        chat,
        isBroadcast: chat.chatType === C.DC_CHAT_TYPE_BROADCAST,
      })
    },
    [openDialog]
  )
}
