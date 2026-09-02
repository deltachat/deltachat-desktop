import { useCallback } from 'react'

import useAlertDialog from './useAlertDialog'
import useConfirmationDialog from './useConfirmationDialog'
import useTranslationFunction from '../useTranslationFunction'
import useDialog from './useDialog'
import { ConfigureProgressDialog } from '../../components/dialogs/ConfigureProgressDialog'

type AddTransportDialogFn = (
  accountId: number,
  transportString: string,
  domainOrAddress: string,
  confirmLabel?: string
) => Promise<boolean>

export default function useAddTransportDialog(): AddTransportDialogFn {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()

  return useCallback(
    async (
      _accountId,
      transportString,
      domainOrAddress,
      confirmLabel = tx('confirm_add_transport')
    ) => {
      const confirmed = await openConfirmationDialog({
        message: `${confirmLabel}\n ${domainOrAddress}`,
      })
      if (!confirmed) {
        return false
      }
      const relayAdded = await new Promise<boolean>(r => {
        openDialog(ConfigureProgressDialog, {
          qrCode: transportString,
          credentials: null,
          onSuccess() {
            r(true)
          },
          onFail(error) {
            r(false)
            openAlertDialog({
              message: 'Relay could not be added. ' + (error satisfies string),
            })
          },
          onClose() {
            // The dialog may call `onClose` before `onSuccess` or `onFail`,
            // so let's ensure to "prefer" those callbacks,
            // by adding `setTimeout`.
            setTimeout(() => r(false))
          },
        })
      })
      return relayAdded
    },
    [openAlertDialog, openConfirmationDialog, openDialog, tx]
  )
}
