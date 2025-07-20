import React from 'react'

import Dialog, {
  CloseFooterAction,
  DialogBody,
  DialogContent,
  DialogHeader,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import { C, type T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../contexts/DialogContext'
import ProfileInfoHeader from '../ProfileInfoHeader'

/**
 * This dialog is used to display the profile of a mailing list
 * (DC_CHAT_TYPE_MAILINGLIST) or a channel as seen by recipient.
 * (DC_CHAT_TYPE_IN_BROADCAST)
 *
 * The main difference to other groups (which use ViewGroup):
 * you don't see other receivers here and you can not edit the group.
 */
export default function MailingListProfile(
  props: {
    chat: T.BasicChat
  } & DialogProps
) {
  const { onClose, chat } = props

  const tx = useTranslationFunction()

  const title =
    chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST
      ? tx('mailing_list')
      : tx('channel')

  return (
    <Dialog onClose={onClose} fixed>
      <DialogHeader title={title} />
      <DialogBody>
        <DialogContent>
          <ProfileInfoHeader
            avatarPath={chat.profileImage ? chat.profileImage : undefined}
            color={chat.color}
            displayName={chat.name}
            isVerified={chat.isProtected}
          />
        </DialogContent>
      </DialogBody>
      <CloseFooterAction onClose={onClose} />
    </Dialog>
  )
}
