import { useContext } from 'react'

import { DialogContext } from '../contexts/DialogContext'

export function useDialog() {
  const { openDialog } = useContext(DialogContext)

  return {
    openDialog,
  }
}
