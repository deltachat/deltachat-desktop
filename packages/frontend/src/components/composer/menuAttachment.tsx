import React, { useContext } from 'react'
import { dirname, basename } from 'path'

import { runtime } from '@deltachat-desktop/runtime-interface'
import { IMAGE_EXTENSIONS } from '../../../../shared/constants'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import SelectContactDialog from '../dialogs/SelectContact'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import { selectedAccountId } from '../../ScreenController'
import Icon from '../Icon'

import { ContextMenuItem } from '../ContextMenu'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'

import type { T } from '@deltachat/jsonrpc-client'
import { BackendRemote } from '../../backend-com'
import ConfirmSendingFiles from '../dialogs/ConfirmSendingFiles'
import useMessage from '../../hooks/chat/useMessage'

type Props = {
  addFileToDraft: (file: string, fileName: string, viewType: T.Viewtype) => void
  showAppPicker: (show: boolean) => void
  selectedChat: Pick<T.BasicChat, 'name' | 'id'> | null
}

// Main component that creates the menu and popover
export default function MenuAttachment({
  addFileToDraft,
  showAppPicker,
  selectedChat,
}: Props) {
  const { openContextMenu } = useContext(ContextMenuContext)

  const tx = useTranslationFunction()
  const { openDialog, closeDialog } = useDialog()
  const { sendMessage } = useMessage()
  const accountId = selectedAccountId()

  const confirmSendMultipleFiles = (
    filePaths: string[],
    msgViewType: T.Viewtype
  ) => {
    if (!selectedChat) {
      throw new Error('no chat selected')
    }
    openDialog(ConfirmSendingFiles, {
      sanitizedFileList: filePaths.map(path => ({ name: basename(path) })),
      chatName: selectedChat.name,
      onClick: async (isConfirmed: boolean) => {
        if (!isConfirmed) {
          return
        }

        for (const filePath of filePaths) {
          await sendMessage(accountId, selectedChat.id, {
            file: filePath,
            // filename
            viewtype: msgViewType,
          })
          // start sending other files, don't wait until last file is sent
          if (runtime.getRuntimeInfo().target === 'browser') {
            // browser created temp files during upload that can now be cleaned up
            runtime.removeTempFile(filePath)
          }
        }
      },
    })
  }

  const addFilenameFile = async () => {
    // function for files
    const { defaultPath, setLastPath } = await rememberLastUsedPath(
      LastUsedSlot.Attachment
    )
    const files = await runtime.showOpenFileDialog({
      filters: [
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
      properties: ['openFile', 'multiSelections'],
      defaultPath,
    })

    if (files.length === 1) {
      setLastPath(dirname(files[0]))
      addFileToDraft(files[0], basename(files[0]), 'File')
    } else if (files.length > 1) {
      confirmSendMultipleFiles(files, 'File')
    }
  }

  const addFilenameMedia = async () => {
    // function for media
    const { defaultPath, setLastPath } = await rememberLastUsedPath(
      LastUsedSlot.Attachment
    )
    const files = await runtime.showOpenFileDialog({
      filters: [
        {
          name: tx('image'),
          extensions: IMAGE_EXTENSIONS,
        },
      ],
      properties: ['openFile', 'multiSelections'],
      defaultPath,
    })

    if (files.length === 1) {
      setLastPath(dirname(files[0]))
      addFileToDraft(files[0], basename(files[0]), 'Image')
    } else if (files.length > 1) {
      confirmSendMultipleFiles(files, 'Image')
    }
  }

  const selectContact = async () => {
    let dialogId = ''
    /**
     * TODO: reduce the overhead: just provide a vcardContact to draft/message
     * and send it as a message. No need to get the vcard from core to create
     * a tmp file to attach it as a file which is then converted into a vcardContact again
     * see https://github.com/deltachat/deltachat-core-rust/pull/5677
     */
    const addContactAsVcard = async (selectedContact: T.Contact) => {
      if (selectedContact) {
        const vCardContact = await BackendRemote.rpc.makeVcard(
          selectedAccountId(),
          [selectedContact.id]
        )
        // Use original name set by contact instead of nickname chosen by user
        const cleanAuthname = (
          selectedContact.authName || selectedContact.address
        ).replace(/[^a-z_A-Z0-9]/gi, '')
        const fileName = `VCard-${cleanAuthname}.vcf`
        const tmp_file = await runtime.writeTempFile(fileName, vCardContact)
        addFileToDraft(tmp_file, fileName, 'Vcard')
        closeDialog(dialogId)
      }
    }
    dialogId = openDialog(SelectContactDialog, { onOk: addContactAsVcard })
  }

  const selectAppPicker = async () => {
    showAppPicker(true)
  }

  // item array used to populate menu
  const menu: (ContextMenuItem | false)[] = [
    {
      icon: 'person',
      label: tx('contact'),
      action: selectContact.bind(null),
    },
    {
      icon: 'apps',
      label: tx('webxdc_app'),
      action: selectAppPicker.bind(null),
      dataTestid: 'open-app-picker',
    },
    {
      icon: 'upload-file',
      label: tx('file'),
      action: addFilenameFile.bind(null),
    },
    { type: 'separator' },
    {
      icon: 'image',
      label: tx('image'),
      action: addFilenameMedia.bind(null),
    },
  ]

  const onClickAttachmentMenu = (event: React.MouseEvent<any, MouseEvent>) => {
    const attachmentMenuButtonElement = document.querySelector(
      '#attachment-menu-button'
    ) as HTMLDivElement

    const boundingBox = attachmentMenuButtonElement.getBoundingClientRect()

    const [x, y] = [boundingBox.x, boundingBox.y]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      x,
      y,
      items: menu,
      ariaAttrs: {
        'aria-labelledby': 'attachment-menu-button',
      },
    })
  }

  return (
    <button
      type='button'
      aria-label={tx('menu_add_attachment')}
      id='attachment-menu-button'
      data-testid='open-attachment-menu'
      className='attachment-button'
      onClick={onClickAttachmentMenu}
    >
      <Icon coloring='contextMenu' icon='paperclip' />
    </button>
  )
}
