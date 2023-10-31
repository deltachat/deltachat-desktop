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

import { sendCallInvitation } from '../helpers/ChatMethods'
import { Type } from '../../backend-com'
import { useStore } from '../../stores/store'
import SettingsStoreInstance from '../../stores/settings'
import { IMAGE_EXTENSIONS } from '../../../shared/constants'
import { T } from '@deltachat/jsonrpc-client'
//function to populate Menu
const MenuAttachmentItems = ({
  itemsArray,
}: {
  itemsArray: MenuAttachmentItemObject[]
}) => {
  return (
    <>
      {itemsArray.map((item: MenuAttachmentItemObject) => (
        <MenuItem
          key={item.id}
          icon={item.icon}
          text={item.text}
          onClick={item.onClick}
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
  addFileToDraft: (file: string, viewType: T.Viewtype) => void
  selectedChat: Type.FullChat | null
}) => {
  const tx = useTranslationFunction()
  const screenContext = useContext(ScreenContext)
  const [settings] = useStore(SettingsStoreInstance)
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
      addFileToDraft(file, 'File')
    }
  }
  //function for media
  const addFilenameMedia = async () => {
    const file = await runtime.showOpenFileDialog({
      filters: [
        {
          name: tx('image'),
          extensions: IMAGE_EXTENSIONS,
        },
      ],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('home'),
    })
    if (file) {
      addFileToDraft(file, 'Image')
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
  const items: MenuAttachmentItemObject[] = [
    settings?.settings.webrtc_instance && {
      id: 0,
      icon: 'phone' as IconName,
      text: tx('videochat'),
      onClick: onVideoChat,
    },
    {
      id: 1,
      icon: 'media' as IconName,
      text: tx('image'),
      onClick: addFilenameMedia.bind(null),
    },
    {
      id: 2,
      icon: 'document' as IconName,
      text: tx('file'),
      onClick: addFilenameFile.bind(null),
    },
  ].filter(item => !!item) as MenuAttachmentItemObject[]

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

type MenuAttachmentItemObject = {
  id: number
  icon: IconName
  text: string
  onClick: todo
}
export default MenuAttachment
