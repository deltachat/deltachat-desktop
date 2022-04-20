import React, { useContext } from 'react'
import {
  Button,
  Position,
  Popover,
  Menu,
  MenuItem,
  IconName,
} from '@blueprintjs/core'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { runtime } from '../../runtime'
import { MEDIA_EXTENSIONS } from '../../../shared/constants'

import { sendCallInvitation } from '../helpers/ChatMethods'
import { FullChat } from '../../../shared/shared-types'
//function to populate Menu
const MenuAttachmentItems = ({
  itemsArray,
}: {
  itemsArray: MenuAttachmentItemObject[]
}) => {
  const tx = useTranslationFunction()
  return (
    <>
      {itemsArray.map((item: MenuAttachmentItemObject) => (
        <MenuItem
          key={item.id}
          icon={item.icon}
          text={item.text}
          onClick={item.onClick}
          aria-label={tx(item.attachment)}
        />
      ))}
    </>
  )
}
//main component that creates the menu and popover
const MenuAttachment = ({
  addFileToDraft,
  selectedChat,
}: {
  addFileToDraft: (file: string) => void
  selectedChat: FullChat | null
}) => {
  const tx = useTranslationFunction()
  const screenContext = useContext(ScreenContext)
  const addFilenameFile = async () => {
    //function for files
    const file = await runtime.showOpenFileDialog({
      filters: [
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('home'),
    })
    if (file) {
      addFileToDraft(file)
    }
  }
  //function for media
  const addFilenameMedia = async () => {
    const file = await runtime.showOpenFileDialog({
      filters: [
        {
          name: 'Media',
          extensions: MEDIA_EXTENSIONS,
        },
      ],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('home'),
    })
    if (file) {
      addFileToDraft(file)
    }
  }

  const onVideoChat = () => {
    if (!selectedChat) {
      return
    }
    screenContext.openDialog('ConfirmationDialog', {
      header: tx('videochat_invite_user_to_videochat', selectedChat.name),
      message: tx('videochat_invite_user_hint'),
      confirmLabel: tx('ok'),
      cb: (yes: boolean) => {
        if (yes) {
          sendCallInvitation(screenContext, selectedChat.id)
        }
      },
    })
  }
  // item array used to populate menu
  const items = [
    {
      id: 0,
      icon: 'phone' as IconName,
      text: tx('videochat'),
      onClick: onVideoChat,
      attachment: 'attachment-images',
    },
    {
      id: 1,
      icon: 'media' as IconName,
      text: tx('media'),
      onClick: addFilenameMedia.bind(null),
      attachment: 'attachment-images',
    },
    {
      id: 2,
      icon: 'document' as IconName,
      text: tx('file'),
      onClick: addFilenameFile.bind(null),
      attachment: 'attachment-files',
    },
  ]

  return (
    <div className='attachment-button'>
      <Popover
        content={
          <Menu>
            <MenuAttachmentItems itemsArray={items} />
          </Menu>
        }
        position={Position.TOP_LEFT}
      >
        <Button id='test-attachment-menu' minimal icon='paperclip' />
      </Popover>
    </div>
  )
}

export type MenuAttachmentItemObject = {
  id: number
  icon: IconName
  text: string
  onClick: todo
  attachment: string
}
export default MenuAttachment
