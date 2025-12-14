import { useCallback } from 'react'

import useDialog from './useDialog'
import AlertDialog, {
  Props as AlertDialogProps,
} from '../../components/dialogs/AlertDialog'

type OpenAlertDialog = Pick<AlertDialogProps, 'message' | 'dataTestid'>
export default function useAlertDialog() {
  const { openDialog } = useDialog()

  return useCallback(
    (args: OpenAlertDialog): Promise<void> => {
      return new Promise(resolve => {
        openDialog(AlertDialog, { cb: resolve, ...args })
      })
    },
    [openDialog]
  )
}
