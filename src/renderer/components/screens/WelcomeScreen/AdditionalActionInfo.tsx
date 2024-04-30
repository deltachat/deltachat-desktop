import React, { useEffect, useState } from 'react'

import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote } from '../../../backend-com'

type Props = {
  accountId: number
}

export default function AdditionalActionInfo(props: Props) {
  const tx = useTranslationFunction()
  const { welcomeQr } = useInstantOnboarding()
  const [contactAddress, setContactAddress] = useState('')

  useEffect(() => {
    const loadContactName = async () => {
      if (!welcomeQr || welcomeQr.qr.kind !== 'askVerifyContact') {
        setContactAddress('')
        return
      }

      const contact = await BackendRemote.rpc.getContact(
        props.accountId,
        welcomeQr.qr.contact_id
      )
      setContactAddress(contact.address)
    }

    loadContactName()
  }, [props.accountId, welcomeQr])

  if (!welcomeQr) {
    return null
  }

  if (welcomeQr.qr.kind === 'askVerifyGroup') {
    return <p>{tx('instant_onboarding_group_info', welcomeQr.qr.grpname)}</p>
  } else if (welcomeQr.qr.kind === 'askVerifyContact') {
    return <p>{tx('instant_onboarding_contact_info', contactAddress)}</p>
  }

  return null
}
