import { Button, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import React, { useCallback } from 'react'

import { IMAGE_EXTENSIONS } from '../../../shared/constants'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { runtime } from '../../runtime'
import SettingsStoreInstance from '../../stores/settings'
import { useStore } from '../../stores/store'
import { sendCallInvitation } from '../helpers/ChatMethods'

import type { Type } from '../../backend-com'
import type { IconName } from '@blueprintjs/core'
import type { T } from '@deltachat/jsonrpc-client'

// Function to populate Menu
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

// Main component that creates the menu and popover
const MenuAttachment = ({
  addFileToDraft,
  selectedChat,
}: {
  addFileToDraft: (file: string, viewType: T.Viewtype) => void
  selectedChat: Type.FullChat | null
}) => {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const { openDialog } = useDialog()
  const [settings] = useStore(SettingsStoreInstance)

  const addFilenameFile = async () => {
    // function for files
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

  const addFilenameMedia = async () => {
    // function for media
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

  const onVideoChat = useCallback(async () => {
    if (!selectedChat) {
      return
    }

    const confirmed = await openConfirmationDialog({
      header: tx('videochat_invite_user_to_videochat', selectedChat.name),
      message: tx('videochat_invite_user_hint'),
      confirmLabel: tx('ok'),
    })

    if (confirmed) {
      sendCallInvitation(openDialog, selectedChat.id)
    }
  }, [openConfirmationDialog, openDialog, selectedChat, tx])

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
