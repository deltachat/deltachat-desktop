import React from 'react'

import Callout from '../../Callout'
import ClickableLink from '../../helpers/ClickableLink'
import HelpButton from './HelpButton'
import ImportQrCode from '../../dialogs/ImportQrCode'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { CHATMAIL_INSTANCES_LIST_URL } from './chatmailInstances'

import styles from './styles.module.scss'

export default function InstantOnboardingFooter() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onScanQRCode = () => {
    openDialog(ImportQrCode, { subtitle: tx('qrscan_hint') })
  }

  return (
    <Callout className={styles.instantOnboardingCallout}>
      <HelpButton />
      <p>
        <a onClick={onScanQRCode}>{tx('qrscan_title')}</a>
      </p>
      <p>
        <ClickableLink href={CHATMAIL_INSTANCES_LIST_URL}>
          {tx('instant_onboarding_show_more_instances')}
        </ClickableLink>
      </p>
    </Callout>
  )
}
