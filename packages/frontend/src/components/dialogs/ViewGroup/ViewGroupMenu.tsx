import React, { useContext } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

import { ContextMenuItem } from '../../ContextMenu'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'
import { CloneChat } from '../CreateChat'
import useChatDialog from '../../../hooks/chat/useChatDialog'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

export default function useViewGroupMenu({
  chat,
  allowEdit,
  isBroadcast,
  onClickEdit,
  showMemberFilter,
  onShowMemberFilter,
}: {
  chat: T.FullChat
  allowEdit: boolean
  isBroadcast: boolean
  onClickEdit: () => void
  showMemberFilter: boolean
  onShowMemberFilter: () => void
}) {
  const { openContextMenu } = useContext(ContextMenuContext)
  const { openEncryptionInfoDialog } = useChatDialog()
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  const menu: (ContextMenuItem | false)[] = [
    allowEdit && {
      label: tx('global_menu_edit_desktop'),
      action: onClickEdit,
      dataTestid: 'view-group-edit',
    },
    !showMemberFilter && {
      label: tx('search'),
      action: onShowMemberFilter,
      dataTestid: 'show-member-filter',
    },
    {
      type: 'separator',
    },
    {
      label: tx('encryption_info_title_desktop'),
      action: () =>
        openEncryptionInfoDialog({ chatId: chat.id, dmChatContact: null }),
      dataTestid: 'encryption-info',
    },
    !isBroadcast && {
      label: tx('clone_chat'),
      action: () => {
        openDialog(CloneChat, {
          setViewMode: 'createGroup',
          chatTemplateId: chat.id,
        })
      },
      dataTestid: 'clone-chat',
    },
  ]

  return (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const boundingBox = event.currentTarget.getBoundingClientRect()

    const [x, y] = [boundingBox.x + 3, boundingBox.y + boundingBox.height - 2]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      x,
      y,
      items: menu,
    })
  }
}
