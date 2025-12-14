import React from 'react'

import { ClickableLink } from '../../helpers/ClickableLink'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  DEFAULT_CHATMAIL_HOSTNAME,
  DEFAULT_INSTANCE_PRIVACY_POLICY_URL,
  isQRWithDefaultInstance,
} from './chatmailInstances'

import type { AccountQr, QrWithUrl } from '../../../backend/qr'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

function extractLinkFromQrCode(qrWithUrl: QrWithUrl<AccountQr>) {
  if (qrWithUrl.qr.kind !== 'account') {
    throw new Error('QR needs to be of kind "account"')
  }

  const matches = qrWithUrl.url.match(URL_REGEX)
  if (matches && matches.length > 0) {
    const { origin } = new URL(matches[0])
    return origin
  }

  return qrWithUrl.qr.domain
}

export default function UserAgreement() {
  const tx = useTranslationFunction()
  const { welcomeQr } = useInstantOnboarding()
  const isDefaultInstance = isQRWithDefaultInstance(welcomeQr)

  return (
    <>
      {isDefaultInstance && (
        <ClickableLink href={DEFAULT_INSTANCE_PRIVACY_POLICY_URL}>
          {tx('instant_onboarding_agree_default2', DEFAULT_CHATMAIL_HOSTNAME)}
        </ClickableLink>
      )}
      {!isDefaultInstance && welcomeQr && welcomeQr.qr.kind === 'account' && (
        <ClickableLink
          href={extractLinkFromQrCode({ ...welcomeQr, qr: welcomeQr.qr })}
        >
          {tx('instant_onboarding_agree_instance', welcomeQr.qr.domain)}
        </ClickableLink>
      )}
    </>
  )
}
