import { useCallback } from 'react'

import useDialog from './useDialog'
import ConfirmationDialog, {
  Props as ConfirmationDialogProps,
} from '../components/dialogs/ConfirmationDialog'

type UseConfirmationDialog = Pick<
  ConfirmationDialogProps,
  | 'cancelLabel'
  | 'confirmLabel'
  | 'header'
  | 'isConfirmDanger'
  | 'message'
  | 'noMargin'
>

export default function useConfirmationDialog(args: UseConfirmationDialog) {
  const { openDialog } = useDialog()

  const openConfirmationDialog = useCallback(() => {
    return new Promise(resolve => {
      const onUserResult = (confirmed: boolean) => {
        resolve(confirmed)
      }

      openDialog(ConfirmationDialog, { cb: onUserResult, ...args })
    })
  }, [openDialog, args])

  return openConfirmationDialog
}
