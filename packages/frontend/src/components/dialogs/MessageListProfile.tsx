import React, { useState } from 'react'

import { useGroupImage, ChatSettingsSetNameAndProfileImage } from './CreateChat'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../ScreenController'
import { modifyGroup } from '../../backend/group'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../contexts/DialogContext'

export default function MailingListProfile(
  props: {
    chat: T.BasicChat
  } & DialogProps
) {
  const { onClose, chat } = props

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const [groupName, setGroupName] = useState(chat.name)
  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(
    chat.profileImage
  )
  const onUpdateGroup = useEdit(
    accountId,
    groupName,
    groupImage,
    chat.id,
    onClose
  )

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
  accountId: number,
  groupName: string,
  groupImage: string | null,
  groupId: number,
  onClose: DialogProps['onClose']
) => {
  const updateGroup = async () => {
    await modifyGroup(accountId, groupId, groupName, groupImage, null)
  }

  const onUpdateGroup = async () => {
    if (groupName === '') return
    await updateGroup()
    onClose()
  }

  return onUpdateGroup
}
