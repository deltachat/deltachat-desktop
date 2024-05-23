import React, { useContext } from 'react'

import Button from '../../Button'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'

import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { ScreenContext } from '../../../contexts/ScreenContext'
import { Screens } from '../../../ScreenController'
import { runtime } from '../../../runtime'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import QrCodeScanner from '../../dialogs/QrCodeScanner'
import { CHATMAIL_INSTANCES_LIST_URL } from './chatmailInstances'
import Icon from '../../Icon'

export default function UseOtherServerDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const { changeScreen } = useContext(ScreenContext)
  const { openDialog } = useDialog()

  const onClickLogin = () => {
    onClose()
    changeScreen(Screens.Login)
  }

  const onScanQRCode = () => {
    onClose()
    openDialog(QrCodeScanner)
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={tx('instant_onboarding_show_more_instances')}
        onClose={onClose}
      />
      <DialogBody>
        <DialogContent>
          <Button
            type='secondary'
            className={styles.welcomeScreenButton}
            onClick={() => runtime.openLink(CHATMAIL_INSTANCES_LIST_URL)}
          >
            {tx('instant_onboarding_other_server')}{' '}
            <Icon icon='open_in_new' className={styles.openExternalIcon} />
          </Button>

          <Button
            type='secondary'
            className={styles.welcomeScreenButton}
            onClick={onClickLogin}
          >
            {tx('manual_account_setup_option')}
          </Button>
          <Button
            type='secondary'
            className={styles.welcomeScreenButton}
            onClick={onScanQRCode}
          >
            {tx('scan_invitation_code')}
          </Button>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
