import { useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import useAlertDialog from './useAlertDialog'
import useConfirmationDialog from './useConfirmationDialog'
import useTranslationFunction from '../useTranslationFunction'

type AddTransportDialogFn = (
  accountId: number,
  transportString: string,
  domainOrAddress: string,
  multiDeviceMode: boolean,
  confirmLabel?: string
) => Promise<boolean>

export default function useAddTransportDialog(): AddTransportDialogFn {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()

  return useCallback(
    async (
      accountId,
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
      try {
        await BackendRemote.rpc.addTransportFromQr(accountId, transportString)
      } catch (e) {
        openAlertDialog({
          message: 'Relay could not be added. ' + (e as Error).message,
        })
        return false
      }
      return true
    },
    [openAlertDialog, openConfirmationDialog, tx]
  )
}
