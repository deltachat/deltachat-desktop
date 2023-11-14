import { useContext } from 'react'

import { DialogContext } from '../contexts/DialogContext'

export function useDialog() {
  const { openDialog, closeDialog, hasOpenDialogs } = useContext(DialogContext)

  return {
    openDialog,
    closeDialog,
    hasOpenDialogs,
  }
}
