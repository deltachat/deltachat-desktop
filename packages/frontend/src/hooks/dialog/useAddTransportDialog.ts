import { useCallback } from 'react'

import { BackendRemote } from '../../backend-com'
import useAlertDialog from './useAlertDialog'
import useConfirmationDialog from './useConfirmationDialog'
import useTranslationFunction from '../useTranslationFunction'

type AddTransportDialogFn = (
  accountId: number,
  transportString: string,
  domainOrAddress: string,
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
      confirmLabel = tx('confirm_add_transport')
    ) => {
      const confirmed = await openConfirmationDialog({
        message: `${confirmLabel}\n ${domainOrAddress}`,
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
