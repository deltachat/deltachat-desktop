import React, { useMemo } from 'react'

import { DisabledChatReasons } from './useIsChatDisabled'
import useTranslationFunction from '../../hooks/useTranslationFunction'

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
        return tx('messaging_disabled_device_chat')
      case DisabledChatReasons.UNKNOWN:
        // Unknown cases are likely to be caused by a new case introduced by a new core update that is not yet handled here,
        // but we don't want to crash the UI
        return 'messaging_disabled_unknown'
      default:
        throw new Error('Invalid read-only chat status')
    }
  }, [reason, tx])

  // If no reason was given we return no component
  if (!reason) {
    return null
  }

  // If we're in the "device message" chat we also do not want to show anything
  if (reason === DisabledChatReasons.DEVICE_CHAT) {
    return null
  }

  return (
    <div className='composer composer--disabled-message-input'>
      {reasonMessage}
    </div>
  )
}

export default DisabledMessageInput
