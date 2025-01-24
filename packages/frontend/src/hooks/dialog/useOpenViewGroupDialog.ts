import { useCallback } from 'react'

import useDialog from './useDialog'
import ViewGroup from '../../components/dialogs/ViewGroup'

export default function useOpenViewGroupDialog() {
  const { openDialog } = useDialog()

  return useCallback(
    (chat: Parameters<typeof ViewGroup>[0]['chat']) => {
      openDialog(ViewGroup, {
        chat,
      })
    },
    [openDialog]
  )
}
