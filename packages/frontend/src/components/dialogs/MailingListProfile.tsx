import React from 'react'

import { useGroupImage } from './CreateChat'
import Dialog, {
  CloseFooterAction,
  DialogBody,
  DialogContent,
  DialogHeader,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../contexts/DialogContext'
import ProfileInfoHeader from '../ProfileInfoHeader'

export default function MailingListProfile(
  props: {
    chat: T.BasicChat
  } & DialogProps
) {
  const { onClose, chat } = props

  const tx = useTranslationFunction()
  const [groupImage] = useGroupImage(chat.profileImage)

  return (
    <Dialog onClose={onClose} fixed>
      <DialogHeader title={tx('mailing_list')} />
      <DialogBody>
        <DialogContent>
          <ProfileInfoHeader
            avatarPath={groupImage ? groupImage : undefined}
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
