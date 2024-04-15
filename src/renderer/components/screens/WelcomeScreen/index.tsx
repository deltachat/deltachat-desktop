import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

import AlertDialog from '../../dialogs/AlertDialog'
import Button from '../../Button'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import ImportButton from './ImportButton'
import ImportQrCode from '../../dialogs/ImportQrCode'
import useDialog from '../../../hooks/dialog/useDialog'
import useProcessQr from '../../../hooks/useProcessQr'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import { Screens } from '../../../ScreenController'
import { getLogger } from '../../../../shared/logger'

import styles from './styles.module.scss'

const log = getLogger('renderer/components/AccountsScreen')

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}

export default function WelcomeScreen({
  selectedAccountId,
  onUnSelectAccount,
  onExitWelcomeScreen,
}: Props) {
  const tx = useTranslationFunction()
  const { openDialog, closeDialog } = useDialog()
  const processQr = useProcessQr()
  const [showBackButton, setShowBackButton] = useState(false)

  const onClickLogin = () => window.__changeScreen(Screens.Login)

  const onClickSecondDevice = () =>
    openDialog(ImportQrCode, {
      subtitle: tx('multidevice_open_settings_on_other_device'),
    })

  const onClickScanQr = () =>
    openDialog(ImportQrCode, { subtitle: tx('qrscan_hint') })

  const onCancel = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(selectedAccountId)
      if (acInfo.kind === 'Unconfigured') {
        await onUnSelectAccount()
        await EffectfulBackendActions.removeAccount(selectedAccountId)
      }
      onExitWelcomeScreen()
    } catch (error) {
      if (error instanceof Error) {
        openDialog(AlertDialog, {
          message: error?.message,
          cb: () => {},
        })
      } else {
        log.error('unexpected error type', error)
        throw error
      }
    }
  }

  useEffect(() => {
    ;(async () => {
      const allAccountIds = await BackendRemote.listAccounts()
      if (allAccountIds && allAccountIds.length > 1) {
        setShowBackButton(true)
      }
      if (window.__welcome_qr) {
        // this is the "callback" when opening dclogin or dcaccount from an already existing account,
        // the app needs to switch to the welcome screen first.
        await processQr(selectedAccountId, window.__welcome_qr, undefined, true)
        window.__welcome_qr = undefined
      }
    })()
  }, [openDialog, closeDialog, processQr, selectedAccountId])

  return (
    <div className='login-screen'>
      <div className='window'>
        <Dialog canEscapeKeyClose fixed onClose={() => {}} width={400}>
          <DialogHeader
            onClickBack={showBackButton ? onCancel : undefined}
            title={tx('add_account')}
          />
          <DialogBody>
            <div className='welcome-deltachat'>
              <img className='delta-icon' src='../images/intro1.png' />
              <p className='f1'>{tx('welcome_chat_over_email')}</p>
              <Button
                className={classNames(styles.welcomeButton, styles.withGap)}
                type='primary'
                onClick={onClickLogin}
              >
                {tx('login_header')}
              </Button>
              <Button
                className={styles.welcomeButton}
                type='secondary'
                onClick={onClickSecondDevice}
              >
                {tx('multidevice_receiver_title')}
              </Button>
              <Button
                className={styles.welcomeButton}
                type='secondary'
                onClick={onClickScanQr}
              >
                {tx('scan_invitation_code')}
              </Button>
              <ImportButton />
            </div>
          </DialogBody>
        </Dialog>
      </div>
    </div>
  )
}
