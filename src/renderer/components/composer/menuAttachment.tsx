import React, { useCallback, useContext } from 'react'
import { dirname } from 'path'

import { runtime } from '../../runtime'
import { useStore } from '../../stores/store'
import SettingsStoreInstance from '../../stores/settings'
import { IMAGE_EXTENSIONS } from '../../../shared/constants'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import SelectContactDialog from '../dialogs/SelectContact'
import useVideoChat from '../../hooks/useVideoChat'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import { selectedAccountId } from '../../ScreenController'
import Icon from '../Icon'

import { ContextMenuItem } from '../ContextMenu'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'

import type { T } from '@deltachat/jsonrpc-client'
import { BackendRemote } from '../../backend-com'

type Props = {
  addFileToDraft: (file: string, viewType: T.Viewtype) => void
  selectedChat: T.FullChat | null
}

// Main component that creates the menu and popover
export default function MenuAttachment({
  addFileToDraft,
  selectedChat,
}: Props) {
  const { openContextMenu } = useContext(ContextMenuContext)

  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const { sendVideoChatInvitation } = useVideoChat()
  const { openDialog, closeDialog } = useDialog()
  const [settings] = useStore(SettingsStoreInstance)
  const accountId = selectedAccountId()

  const addFilenameFile = async () => {
    // function for files
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.Attachment
    )
    const file = await runtime.showOpenFileDialog({
      filters: [
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
      properties: ['openFile'],
      defaultPath,
    })

    if (file) {
      setLastPath(dirname(file))
      addFileToDraft(file, 'File')
    }
  }

  const addFilenameMedia = async () => {
    // function for media
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.Attachment
    )
    const file = await runtime.showOpenFileDialog({
      filters: [
        {
          name: tx('image'),
          extensions: IMAGE_EXTENSIONS,
        },
      ],
      properties: ['openFile'],
      defaultPath,
    })

    if (file) {
      setLastPath(dirname(file))
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
      sendVideoChatInvitation(accountId, selectedChat.id)
    }
  }, [
    accountId,
    openConfirmationDialog,
    selectedChat,
    sendVideoChatInvitation,
    tx,
  ])

  const selectContact = async () => {
    const { setLastPath } = rememberLastUsedPath(LastUsedSlot.Attachment)
    let dialogId = ''
    /**
     * TODO: reduce the overhead: just provide a vcardContact to draft/message
     * and send it as a message. No need to get the vcard from core to create
     * a tmp file to attach it as a file which is then converted into a vcardContact again
     */
    const addContactAsVcard = async (selectedContact: T.Contact) => {
      if (selectedContact) {
        const vCardContact = await BackendRemote.rpc.makeVcard(
          selectedAccountId(),
          [selectedContact.id]
        )
        const cleanDisplayname = selectedContact.displayName.replace(
          /[^a-z_A-Z0-9]/gi,
          ''
        )
        const tmp_file = await runtime.writeTempFileFromBase64(
          `VCard-${cleanDisplayname}.vcf`,
          btoa(vCardContact)
        )
        setLastPath(dirname(tmp_file))
        addFileToDraft(tmp_file, 'Vcard')
        closeDialog(dialogId)
      }
    }
    dialogId = openDialog(SelectContactDialog, { onOk: addContactAsVcard })
  }

  // item array used to populate menu
  const menu: (ContextMenuItem | false)[] = [
    !!settings?.settings.webrtc_instance && {
      icon: 'phone',
      label: tx('videochat'),
      action: onVideoChat,
    },
    {
      icon: 'image',
      label: tx('image'),
      action: addFilenameMedia.bind(null),
    },
    {
      icon: 'upload-file',
      label: tx('file'),
      action: addFilenameFile.bind(null),
    },
    {
      icon: 'person',
      label: tx('contact'),
      action: selectContact.bind(null),
    },
  ]

  const onClickAttachmentMenu = (event: React.MouseEvent<any, MouseEvent>) => {
    const attachmentMenuButtonElement = document.querySelector(
      '#attachment-menu-button'
    ) as HTMLDivElement

    const boundingBox = attachmentMenuButtonElement.getBoundingClientRect()

    const [cursorX, cursorY] = [boundingBox.x, boundingBox.y]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      cursorX,
      cursorY,
      items: menu,
    })
  }

  return (
    <button
      id='attachment-menu-button'
      className='attachment-button'
      onClick={onClickAttachmentMenu}
    >
      <Icon coloring='context-menu' icon='paperclip' />
    </button>
  )
}
