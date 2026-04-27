import React from 'react'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import { type T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../contexts/DialogContext'
import ProfileInfoHeader from '../ProfileInfoHeader'
import { shouldDisableClickForFullscreen } from '../Avatar'
import { BackendRemote } from '../../backend-com'
import { useRpcFetch } from '../../hooks/useFetch'

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
    accountId: number
    chat: T.BasicChat & {
      chatType: 'Mailinglist' | 'InBroadcast'
    }
  } & DialogProps
) {
  const { onClose, chat, accountId } = props

  const tx = useTranslationFunction()

  const descriptionFetch = useRpcFetch(
    BackendRemote.rpc.getChatDescription,
    chat.chatType === 'InBroadcast' ? [accountId, chat.id] : null
  )
  const groupDescription = descriptionFetch?.result?.ok
    ? descriptionFetch.result.value
    : null

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
            description={groupDescription ?? undefined}
          />
          <div style={{ margin: '1rem 0' }}></div>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
