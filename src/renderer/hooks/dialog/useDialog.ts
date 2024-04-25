import { useContext } from 'react'

import { DialogContext } from '../../contexts/DialogContext'

export default function useDialog() {
  const { openDialog, closeDialog, hasOpenDialogs, closeAllDialogs } =
    useContext(DialogContext)

  return {
    openDialog,
    closeDialog,
    hasOpenDialogs,
    closeAllDialogs,
  }
}
