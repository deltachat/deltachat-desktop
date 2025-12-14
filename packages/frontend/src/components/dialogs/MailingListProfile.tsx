import React from 'react'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import { type T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../contexts/DialogContext'
import ProfileInfoHeader from '../ProfileInfoHeader'
import { shouldDisableClickForFullscreen } from '../Avatar'

/**
 * This dialog is used to display the profile of a mailing list
 * (chatType == 'Mailinglist') or a channel as seen by recipient.
 * (chatType == 'InBroadcast')
 *
 * The main difference to other groups (which use ViewGroup):
 * you don't see other receivers here and you can not edit the group.
 */
export default function MailingListProfile(
  props: {
    chat: T.BasicChat & {
      chatType: 'Mailinglist' | 'InBroadcast'
    }
  } & DialogProps
) {
  const { onClose, chat } = props

  const tx = useTranslationFunction()

  const title =
    chat.chatType === 'Mailinglist' ? tx('mailing_list') : tx('channel')

  return (
    <Dialog onClose={onClose} fixed>
      <DialogHeader title={title} onClose={onClose} />
      <DialogBody>
        <DialogContent>
          <ProfileInfoHeader
            avatarPath={chat.profileImage ? chat.profileImage : undefined}
            color={chat.color}
            displayName={chat.name}
            disableFullscreen={shouldDisableClickForFullscreen(chat)}
          />
          <div style={{ margin: '1rem 0' }}></div>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
