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
  multiDeviceMode: boolean,
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
      multiDeviceMode,
      confirmLabel = tx('confirm_add_transport')
    ) => {
      let message = `${confirmLabel}\n ${domainOrAddress}`
      if (multiDeviceMode) {
        message +=
          '\n\nNote if using multi-device:\nbefore changing or adding transports make sure all other devices have at least version 2.33.0 installed. Otherwise they will run out of sync.'
      }
      const confirmed = await openConfirmationDialog({
        message,
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
