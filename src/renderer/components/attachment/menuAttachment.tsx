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
  const addFilenameFile = async () => {
    //function for files
    const file = await runtime.showOpenFileDialog({
      filters: [
        {
          name: 'Files',
          extensions: [
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'ppt',
            'pdf',
            'txt',
            'csv',
            'log',
            'zip',
          ],
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
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'mkv', 'avi', 'mp4'],
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
      icon: 'document' as IconName,
      text: 'Document',
      onClick: addFilenameFile.bind(null),
      attachment: 'attachment-files',
    },
    {
      id: 1,
      icon: 'media' as IconName,
      text: 'Media',
      onClick: addFilenameMedia.bind(null),
      attachment: 'attachment-images',
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
        position={Position.RIGHT_TOP}
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
