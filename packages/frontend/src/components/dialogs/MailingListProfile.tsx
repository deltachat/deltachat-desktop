import React, { useContext } from 'react'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import HeaderButton from '../Dialog/HeaderButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import { type T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../contexts/DialogContext'
import ProfileInfoHeader from '../ProfileInfoHeader'
import { shouldDisableClickForFullscreen } from '../Avatar'
import { BackendRemote } from '../../backend-com'
import { useRpcFetch } from '../../hooks/useFetch'
import { ContextMenuItem } from '../ContextMenu'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import useChatDialog from '../../hooks/chat/useChatDialog'

/**
 * This dialog is used to display the profile of a mailing list
 * (chatType == 'Mailinglist') or a channel as seen by recipient.
 * (chatType == 'InBroadcast')
 *
 * The main difference to other groups (which use ViewGroup):
 * you don't see other receivers here and you can not edit the group.
 */
export default function MailingListProfile(
  props: {
    accountId: number
    chat: T.BasicChat & {
      chatType: 'Mailinglist' | 'InBroadcast'
    }
  } & DialogProps
) {
  const { onClose, chat, accountId } = props

  const tx = useTranslationFunction()

  const onClickMenu = useMailingListProfileMenu(chat)

  const descriptionFetch = useRpcFetch(
    BackendRemote.rpc.getChatDescription,
    chat.chatType === 'InBroadcast' ? [accountId, chat.id] : null
  )
  const groupDescription = descriptionFetch?.result?.ok
    ? descriptionFetch.result.value
    : null

  const title =
    chat.chatType === 'Mailinglist' ? tx('mailing_list') : tx('channel')

  return (
    <Dialog onClose={onClose} fixed>
      <DialogHeader title={title} onClose={onClose}>
        <HeaderButton
          id='mailing-list-profile-menu'
          data-testid='mailing-list-profile-menu'
          onClick={onClickMenu}
          icon='more_vert'
          iconSize={24}
          aria-label={tx('menu_more_options')}
        />
      </DialogHeader>
      <DialogBody>
        <DialogContent>
          <ProfileInfoHeader
            avatarPath={chat.profileImage ? chat.profileImage : undefined}
            color={chat.color}
            displayName={chat.name}
            disableFullscreen={shouldDisableClickForFullscreen(chat)}
            description={groupDescription ?? undefined}
          />
          <div style={{ margin: '1rem 0' }}></div>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}

/**
 * Three-dot menu for the mailing list / channel (recipient side) profile.
 * just to be consistent with other profiles, although the menu has only one item
 */
function useMailingListProfileMenu(chat: T.BasicChat) {
  const { openContextMenu } = useContext(ContextMenuContext)
  const { openEncryptionInfoDialog } = useChatDialog()
  const tx = useTranslationFunction()

  const menu: (ContextMenuItem | false)[] = [
    {
      label: tx('encryption_info_title_desktop'),
      action: () =>
        openEncryptionInfoDialog({ chatId: chat.id, dmChatContact: null }),
      dataTestid: 'encryption-info',
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
