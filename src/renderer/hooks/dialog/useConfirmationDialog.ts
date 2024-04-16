import { useCallback } from 'react'

import useDialog from './useDialog'
import ConfirmationDialog, {
  Props as ConfirmationDialogProps,
} from '../../components/dialogs/ConfirmationDialog'

type OpenConfirmationDialog = Pick<
  ConfirmationDialogProps,
  | 'cancelLabel'
  | 'confirmLabel'
  | 'header'
  | 'isConfirmDanger'
  | 'message'
  | 'noMargin'
>

export default function useConfirmationDialog() {
  const { openDialog } = useDialog()

  return useCallback(
    (args: OpenConfirmationDialog) => {
      return new Promise(resolve => {
        const onUserResult = (confirmed: boolean) => {
          resolve(confirmed)
        }

        openDialog(ConfirmationDialog, { cb: onUserResult, ...args })
      })
    },
    [openDialog]
  )
}
