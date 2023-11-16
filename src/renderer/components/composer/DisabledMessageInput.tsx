import React, { useMemo } from 'react'

import { useTranslationFunction } from '../../contexts'
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
        return tx('messaging_disabled_device_chat')
      default:
        throw new Error('Unknown read-only chat status')
    }
  }, [reason, tx])

  // If no reason was given we return no component
  if (!reason) {
    return null
  }

  // If we're in the device message chat we also do not want to show anything
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
