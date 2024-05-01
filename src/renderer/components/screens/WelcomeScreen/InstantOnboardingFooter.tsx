import React from 'react'

import Callout from '../../Callout'
import ClickableLink from '../../helpers/ClickableLink'
import QrCodeScanner from '../../dialogs/QrCodeScanner'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { CHATMAIL_INSTANCES_LIST_URL } from './chatmailInstances'

import styles from './styles.module.scss'

export default function InstantOnboardingFooter() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onScanQRCode = () => {
    openDialog(QrCodeScanner)
  }

  return (
    <Callout className={styles.instantOnboardingCallout}>
      <p>
        <ClickableLink href={CHATMAIL_INSTANCES_LIST_URL}>
          {tx('instant_onboarding_show_more_instances')}
        </ClickableLink>
        {' • '}
        <a onClick={onScanQRCode}>{tx('qrscan_title')}</a>
      </p>
    </Callout>
  )
}
