import { useContext } from 'react'

import { DialogContext } from '../contexts/DialogContext'

export function useDialog() {
  const { openDialog, closeDialog } = useContext(DialogContext)

  return {
    openDialog,
    closeDialog,
  }
}
