import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { C } from '@deltachat/jsonrpc-client'
import classNames from 'classnames'

import { useChatList } from '../../chat/ChatListHelpers'
import { useLogicVirtualChatList, ChatListPart } from '../../chat/ChatList'
import MessageBody from '../../message/MessageBody'
import { useThemeCssVar } from '../../../ThemeManager'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { InlineVerifiedIcon } from '../../VerifiedIcon'
import { getLogger } from '../../../../../shared/logger'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import HeaderButton from '../../Dialog/HeaderButton'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/dialog/useDialog'
import useChat from '../../../hooks/chat/useChat'
import useOpenViewProfileDialog from '../../../hooks/dialog/useOpenViewProfileDialog'
import { MessagesDisplayContext } from '../../../contexts/MessagesDisplayContext'
import ProfileInfoHeader from '../../ProfileInfoHeader'
import Button from '../../Button'

import useViewProfileMenu from './menu'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import type { T } from '@deltachat/jsonrpc-client'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'
import { ChatListItemRowChat } from '../../chat/ChatListItemRow'
import { shouldDisableClickForFullscreen } from '../../Avatar'

const log = getLogger('renderer/dialogs/ViewProfile')

function LastSeen({ timestamp }: { timestamp: number }) {
  const tx = useTranslationFunction()
  let lastSeenString = ''
  let lastSeenAbsolute: string | undefined = undefined

  // Dates from 1970 mean that contact has never been seen
  if (timestamp == 0) {
    lastSeenString = tx('last_seen_unknown')
  } else {
    const date = moment(timestamp * 1000).fromNow()
    lastSeenString = tx('last_seen_relative', date)
    lastSeenAbsolute = tx(
      'last_seen_at',
      moment(timestamp * 1000).toLocaleString()
    )
  }

  return (
    <span className='last-seen' title={lastSeenAbsolute}>
      {lastSeenString}
    </span>
  )
}

export default function ViewProfile(
  props: {
    contact: T.Contact
    onBack?: () => void
    onAction?: () => void
  } & DialogProps
) {
  const { onClose, onBack, onAction } = props

  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const [contact, setContact] = useState<T.Contact>(props.contact)

  useEffect(() => {
    return onDCEvent(accountId, 'ContactsChanged', () => {
      BackendRemote.rpc.getContact(accountId, contact.id).then(setContact)
    })
  }, [accountId, contact.id])

  const isDeviceChat = contact.id === C.DC_CONTACT_ID_DEVICE
  const isSelfChat = contact.id === C.DC_CONTACT_ID_SELF

  const showMenu = !(isDeviceChat || isSelfChat)

  const onClickViewProfileMenu = useViewProfileMenu(contact, onClose)

  return (
    <Dialog
      width={400}
      onClose={onClose}
      fixed
      className={styles.viewProfileDialog}
    >
      <DialogHeader
        title={contact.isBot ? tx('bot') : tx('contact')}
        onClose={onClose}
        onClickBack={onBack}
      >
        {showMenu && (
          <>
            <HeaderButton
              id='view-profile-menu'
              onClick={onClickViewProfileMenu}
              icon='more_vert'
              iconSize={24}
              aria-label='Profile Menu'
            />
          </>
        )}
      </DialogHeader>
      <DialogBody className={styles.viewProfileDialogBody}>
        <ViewProfileInner
          contact={contact}
          onClose={onClose}
          onAction={onAction}
        />
      </DialogBody>
    </Dialog>
  )
}

export function ViewProfileInner({
  contact,
  onClose,
  onAction,
}: {
  contact: T.Contact
  onClose: () => void
  onAction?: () => void
}) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { selectChat } = useChat()
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { chatListIds } = useChatList(null, '', contact.id)
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)
  const [selfChatAvatar, setSelfChatAvatar] = useState<string | null>(null)
  const [verifier, setVerifier] = useState<null | {
    label: string
    action?: () => void
  }>(null)

  const mutualChatsListRef = useRef<HTMLDivElement>(null)

  const isDeviceChat = contact.id === C.DC_CONTACT_ID_DEVICE
  const isSelfChat = contact.id === C.DC_CONTACT_ID_SELF

  const onChatClick = (chatId: number) => {
    selectChat(accountId, chatId)
    onAction?.()
    onClose()
  }
  const onSendMessage = async () => {
    const dmChatId = await BackendRemote.rpc.createChatByContactId(
      accountId,
      contact.id
    )
    onChatClick(dmChatId)
  }

  const onUnblockContact = async () => {
    await BackendRemote.rpc.unblockContact(accountId, contact.id)
  }

  useEffect(() => {
    if (isSelfChat) {
      ;(async () => {
        const chatid = await BackendRemote.rpc.createChatByContactId(
          accountId,
          C.DC_CONTACT_ID_SELF
        )
        const { profileImage } = await BackendRemote.rpc.getBasicChatInfo(
          accountId,
          chatid
        )
        setSelfChatAvatar(profileImage)
      })()
    }
  }, [accountId, isSelfChat])

  useEffect(() => {
    ;(async () => {
      if (contact.isVerified) {
        // it might happen that a verified contact has no verifiedBy ID
        setVerifier({ label: tx('verified_by_unknown') })
      } else {
        setVerifier(null) // will be overridden if verifiedBy ID is available
      }

      if (contact.verifierId === C.DC_CONTACT_ID_SELF) {
        setVerifier({ label: tx('verified_by_you') })
      } else if (contact.verifierId !== null) {
        const verifierContactId = contact.verifierId
        try {
          const { displayName } = await BackendRemote.rpc.getContact(
            accountId,
            verifierContactId
          )
          if (displayName && displayName !== '') {
            setVerifier({
              label: tx('verified_by', displayName),
              action: () => openViewProfileDialog(accountId, verifierContactId),
            })
          }
        } catch (error) {
          log.error('failed to load verifier contact', error)
          setVerifier({
            label:
              'verified by: failed to load verifier contact, please report this issue',
          })
        }
      }
    })()
  }, [
    accountId,
    contact.id,
    contact.verifierId,
    contact.isVerified,
    openDialog,
    openViewProfileDialog,
    tx,
  ])

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  let displayName = contact.displayName
  let addressLine = contact.address
  let statusText = contact.status
  let avatarPath = contact.profileImage

  if (isDeviceChat) {
    addressLine = tx('device_talk_subtitle')
  } else if (isSelfChat) {
    displayName = tx('saved_messages')
    addressLine = tx('chat_self_talk_subtitle')
    statusText = tx('saved_messages_explain')
    avatarPath = selfChatAvatar
  }

  // edge case: if there are more than 150 mutual chats,
  // we load them in a virtual list
  const maxChatItemsOnFirstLoad = 150
  // and limit the height to 5 visible items
  const maxMinHeightItems = 5
  const mutualChatsHeightFactor =
    chatListIds.length > maxChatItemsOnFirstLoad
      ? Math.max(Math.min(maxMinHeightItems, chatListIds.length), 1)
      : chatListIds.length

  const mutualChatsHeight = CHATLISTITEM_CHAT_HEIGHT * mutualChatsHeightFactor
  const VerificationTag = verifier?.action ? 'button' : 'div'

  return (
    <>
      <DialogContent>
        <ProfileInfoHeader
          avatarPath={avatarPath ? avatarPath : undefined}
          color={contact.color}
          displayName={displayName}
          wasSeenRecently={contact.wasSeenRecently}
          disableFullscreen={
            isSelfChat ||
            isDeviceChat ||
            shouldDisableClickForFullscreen(contact)
          }
        />
        {statusText !== '' && (
          <>
            <div className={styles.statusText}>
              <MessagesDisplayContext.Provider
                value={{
                  context: 'contact_profile_status',
                  contact_id: contact.id,
                  closeProfileDialog: onClose,
                }}
              >
                <MessageBody text={statusText} disableJumbomoji />
              </MessagesDisplayContext.Provider>
            </div>
            <div
              className={classNames(
                'group-separator',
                styles.extendedSeparator
              )}
            ></div>
          </>
        )}
        {!isSelfChat && (
          <div className={styles.contactAttributes}>
            {contact.lastSeen !== 0 && (
              <div>
                <i className='material-svg-icon material-icon-schedule' />
                <LastSeen timestamp={contact.lastSeen} />
              </div>
            )}
            {contact.isBlocked && (
              <div>
                <i className='material-svg-icon material-icon-blocked' />
                {tx('contact_is_blocked')}
              </div>
            )}
          </div>
        )}
      </DialogContent>
      <div className={styles.buttonWrap}>
        {!isDeviceChat && !contact.isBlocked && (
          <Button onClick={onSendMessage}>{tx('send_message')}</Button>
        )}
        {!isDeviceChat && contact.isBlocked && (
          <Button onClick={onUnblockContact}>
            {tx('menu_unblock_contact')}
          </Button>
        )}
      </div>
      {!(isDeviceChat || isSelfChat) && (
        <>
          <div id='view-profile-mutual-chats-title' className='group-separator'>
            {tx('profile_shared_chats')}
          </div>
          <div
            ref={mutualChatsListRef}
            className={styles.mutualChats}
            style={{ minHeight: mutualChatsHeight }}
          >
            <RovingTabindexProvider wrapperElementRef={mutualChatsListRef}>
              <AutoSizer disableWidth>
                {({ height }) => (
                  <ChatListPart
                    olElementAttrs={{
                      'aria-labelledby': 'view-profile-mutual-chats-title',
                    }}
                    isRowLoaded={isChatLoaded}
                    loadMoreRows={loadChats}
                    rowCount={chatListIds.length}
                    width={'100%'}
                    height={height}
                    itemKey={index => 'key' + chatListIds[index]}
                    itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                    itemData={{
                      chatCache,
                      chatListIds,
                      onChatClick,

                      activeChatId: null,
                      activeContextMenuChatIds: [],
                      openContextMenu: async () => {},
                    }}
                  >
                    {ChatListItemRowChat}
                  </ChatListPart>
                )}
              </AutoSizer>
            </RovingTabindexProvider>
          </div>
          {!isSelfChat && (
            <div className={styles.contactAttributesBottom}>
              {verifier && (
                <VerificationTag
                  className={styles.verification}
                  onClick={verifier.action}
                  style={{ display: 'flex' }}
                >
                  <InlineVerifiedIcon />
                  {verifier.label}
                </VerificationTag>
              )}
              {contact.address && (
                <div className={styles.addressLine}>
                  <i className='material-svg-icon material-icon-server' />
                  {addressLine}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
