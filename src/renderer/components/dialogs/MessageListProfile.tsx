import React, { useState } from 'react'
import { Card, Classes } from '@blueprintjs/core'

import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import { useGroupImage, ChatSettingsSetNameAndProfileImage } from './CreateChat'
import { Type } from '../../backend-com'
import { modifyGroup } from '../helpers/ChatMethods'

import type { DialogProps } from '../../contexts/DialogContext'

export default function MailingListProfile(
  props: {
    chat: Type.FullChat
  } & DialogProps
) {
  const { onClose, chat } = props

  const tx = window.static_translate

  const [groupName, setGroupName] = useState(chat.name)
  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(
    chat.profileImage
  )
  const onUpdateGroup = useEdit(groupName, groupImage, chat.id, onClose)

  return (
    <DeltaDialogBase onClose={onClose} fixed>
      <DeltaDialogHeader title={tx('mailing_list')} />
      <div className={Classes.DIALOG_BODY}>
        <Card>
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
        </Card>
      </div>
      <DeltaDialogOkCancelFooter onCancel={onClose} onOk={onUpdateGroup} />
    </DeltaDialogBase>
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
