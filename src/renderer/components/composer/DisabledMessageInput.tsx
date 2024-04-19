import React, { useMemo } from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import { DisabledChatReasons } from './useIsChatDisabled'

type Props = {
  reason?: DisabledChatReasons
}

const DisabledMessageInput = ({ reason }: Props) => {
  const tx = useTranslationFunction()

  const reasonMessage = useMemo(() => {
    switch (reason) {
      case DisabledChatReasons.MAILING_LIST:
        return tx('messaging_disabled_mailing_list')
      case DisabledChatReasons.NOT_IN_GROUP:
        return tx('messaging_disabled_not_in_group')
      case DisabledChatReasons.DEADDROP:
        return tx('messaging_disabled_deaddrop')
      case DisabledChatReasons.DEVICE_CHAT:
        // To not clutter UI, hide reasoning bar for "Device Messages"
        return null
      case DisabledChatReasons.UNKNOWN:
        // Unknown cases are likely to be caused by a new case introduced by a new core update that is not yet handled here,
        // but we don't want to crash the UI
        return 'messaging_disabled_unknown'
      default:
        throw new Error('Invalid read-only chat status')
    }
  }, [reason, tx])

  if (!reasonMessage) {
    return null
  }

  return (
    <div className='composer composer--disabled-message-input'>
      {reasonMessage}
    </div>
  )
}

export default DisabledMessageInput
