import React, { useState } from 'react'

import { ChatSettingsSetNameAndProfileImage, useGroupImage } from './CreateChat'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import { modifyGroup } from '../helpers/ChatMethods'

import type { Type } from '../../backend-com'
import type { DialogProps } from '../../contexts/DialogContext'

export default function MailingListProfile(
  props: {
    chat: Type.FullChat
  } & DialogProps
) {
  const { onClose, chat } = props

  const tx = useTranslationFunction()
  const [groupName, setGroupName] = useState(chat.name)
  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(
    chat.profileImage
  )
  const onUpdateGroup = useEdit(groupName, groupImage, chat.id, onClose)

  return (
    <Dialog onClose={onClose} fixed>
      <DialogHeader title={tx('mailing_list')} />
      <DialogBody>
        <DialogContent>
          <ChatSettingsSetNameAndProfileImage
            groupImage={groupImage}
            onSetGroupImage={onSetGroupImage}
            onUnsetGroupImage={onUnsetGroupImage}
            chatName={groupName}
            setChatName={setGroupName}
            errorMissingChatName={errorMissingGroupName}
            setErrorMissingChatName={setErrorMissingGroupName}
            color={chat.color}
            type='group'
          />
          <div style={{ padding: '15px 0px' }}>
            {tx('mailing_list_profile_info')}
          </div>
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClose} onOk={onUpdateGroup} />
    </Dialog>
  )
}

const useEdit = (
  groupName: string,
  groupImage: string | null | undefined,
  groupId: number,
  onClose: DialogProps['onClose']
) => {
  const updateGroup = async () => {
    await modifyGroup(groupId, groupName, groupImage || undefined, null)
  }
  const onUpdateGroup = async () => {
    if (groupName === '') return
    await updateGroup()
    onClose()
  }
  return onUpdateGroup
}
