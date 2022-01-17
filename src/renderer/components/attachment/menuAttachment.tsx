import React from 'react'
import {
  Button,
  Position,
  Popover,
  Menu,
  MenuItem,
  IconName,
} from '@blueprintjs/core'
import { useTranslationFunction } from '../../contexts'
import { runtime } from '../../runtime'
import { MEDIA_EXTENSIONS } from '../../../shared/constants'

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
}: {
  addFileToDraft: (file: string) => void
}) => {
  const tx = useTranslationFunction()
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
  // item array used to populate menu
  const items = [
    {
      id: 0,
      icon: 'media' as IconName,
      text: tx('media'),
      onClick: addFilenameMedia.bind(null),
      attachment: 'attachment-images',
    },
    {
      id: 1,
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
        <Button minimal icon='paperclip' />
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
