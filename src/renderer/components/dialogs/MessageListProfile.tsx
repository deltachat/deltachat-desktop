import React, { useState } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Card, Classes } from '@blueprintjs/core'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import {
  useGroupImage,
  GroupSettingsSetNameAndProfileImage,
} from './CreateChat'

import { DialogProps } from './DialogController'
import { FullChat } from '../../../shared/shared-types'

export default function MessageListProfile(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  chat: FullChat
}) {
  const { isOpen, onClose, chat } = props

  const tx = window.static_translate

  const [groupName, setGroupName] = useState(chat.name)
  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(
    chat.profileImage
  )
  const onUpdateGroup = useEdit(groupName, groupImage, chat.id, onClose)

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader title={tx('mailing_list')} />
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <GroupSettingsSetNameAndProfileImage
            groupImage={groupImage}
            onSetGroupImage={onSetGroupImage}
            onUnsetGroupImage={onUnsetGroupImage}
            groupName={groupName}
            setGroupName={setGroupName}
            errorMissingGroupName={errorMissingGroupName}
            setErrorMissingGroupName={setErrorMissingGroupName}
            color={chat.color}
            isVerified={chat.isProtected}
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
  groupImage: string,
  groupId: number,
  onClose: DialogProps['onClose']
) => {
  const updateGroup = async () => {
    await DeltaBackend.call(
      'chat.modifyGroup',
      groupId,
      groupName,
      groupImage,
      [],
      []
    )
  }
  const onUpdateGroup = async () => {
    if (groupName === '') return
    await updateGroup()
    onClose()
  }
  return onUpdateGroup
}
