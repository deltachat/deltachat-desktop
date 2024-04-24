import React from 'react'

import ClickableLink from '../../helpers/ClickableLink'
import Switch from '../../Switch'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  DEFAULT_INSTANCE_PRIVACY_POLICY_URL,
  isQRWithDefaultInstance,
} from './chatmailInstances'

type Props = {
  onChange: (value: boolean) => void
  checked: boolean
}

export default function UserAgreement({ onChange, checked }: Props) {
  const tx = useTranslationFunction()
  const { welcomeQr } = useInstantOnboarding()
  const isDefaultInstance = isQRWithDefaultInstance(welcomeQr)

  return (
    <>
      <Switch alignIndicator='left' onChange={onChange} checked={checked}>
        {isDefaultInstance && (
          <>
            {tx('instant_onboarding_agree_default')}{' '}
            <ClickableLink href={DEFAULT_INSTANCE_PRIVACY_POLICY_URL}>
              {tx('instant_onboarding_agree_privacy_policy')}
            </ClickableLink>
          </>
        )}
        {!isDefaultInstance && welcomeQr && welcomeQr.qr.kind === 'account' && (
          <>
            {tx('instant_onboarding_agree_instance')}{' '}
            <ClickableLink href={welcomeQr.qr.domain}>
              {welcomeQr.qr.domain}
            </ClickableLink>
          </>
        )}
      </Switch>
    </>
  )
}
