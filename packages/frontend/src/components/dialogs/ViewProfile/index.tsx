import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { C } from '@deltachat/jsonrpc-client'

import ChatListItem from '../../chat/ChatListItem'
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

  const onClickViewProfileMenu = useViewProfileMenu(contact)

  const handleClose = (result: string) => {
    if (result === 'close') {
      onClose()
    } else if (result === 'cancel') {
      onBack && onBack()
    }
  }

  return (
    <Dialog
      width={400}
      onClose={handleClose}
      fixed
      className={styles.viewProfileDialog}
    >
      <DialogHeader
        title={tx('contact')}
        onClose={handleClose}
        onClickBack={onBack}
      >
        {showMenu && (
          <HeaderButton
            id='view-profile-menu'
            onClick={onClickViewProfileMenu}
            icon='more'
            iconSize={24}
            rotation={90}
            aria-label='Profile Menu'
          ></HeaderButton>
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

  const isDeviceChat = contact.id === C.DC_CONTACT_ID_DEVICE
  const isSelfChat = contact.id === C.DC_CONTACT_ID_SELF

  const onChatClick = (chatId: number) => {
    selectChat(accountId, chatId)
    onAction && onAction()
    onClose()
  }
  const onSendMessage = async () => {
    const dmChatId = await BackendRemote.rpc.createChatByContactId(
      accountId,
      contact.id
    )
    onChatClick(dmChatId)
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
      if (contact.verifierId === null) {
        setVerifier(null)
      } else if (contact.verifierId === C.DC_CONTACT_ID_SELF) {
        setVerifier({ label: tx('verified_by_you') })
      } else {
        setVerifier(null) // make sure it rather shows nothing than wrong values
        const verifierContactId = contact.verifierId
        try {
          const { displayName } = await BackendRemote.rpc.getContact(
            accountId,
            verifierContactId
          )
          setVerifier({
            label: tx('verified_by', displayName),
            action: () => openViewProfileDialog(accountId, verifierContactId),
          })
        } catch (error) {
          log.error('failed to load verifier contact', error)
          setVerifier({
            label:
              'verified by: failed to load verifier contact, please report this issue',
            action: () => openViewProfileDialog(accountId, verifierContactId),
          })
        }
      }
    })()
  }, [
    accountId,
    contact.id,
    contact.verifierId,
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

  const maxMinHeightItems = 5
  const mutualChatsMinHeight =
    CHATLISTITEM_CHAT_HEIGHT *
    Math.max(Math.min(maxMinHeightItems, chatListIds.length), 1)

  const VerificationTag = verifier?.action ? 'button' : 'div'

  return (
    <>
      <DialogContent>
        <ProfileInfoHeader
          address={addressLine}
          avatarPath={avatarPath ? avatarPath : undefined}
          color={contact.color}
          displayName={displayName}
          isVerified={contact.isProfileVerified}
          wasSeenRecently={contact.wasSeenRecently}
        />
        {!isSelfChat && (
          <div className='contact-attributes'>
            {verifier && (
              <VerificationTag
                className='verification'
                onClick={verifier.action}
                style={{ display: 'flex' }}
              >
                <InlineVerifiedIcon />
                {verifier.label}
              </VerificationTag>
            )}
            {contact.lastSeen !== 0 && (
              <div>
                <i className='material-svg-icon material-icon-schedule' />
                <LastSeen timestamp={contact.lastSeen} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
      <div
        style={{
          display: 'flex',
          margin: '20px 0px',
          justifyContent: 'center',
        }}
      >
        {!isDeviceChat && (
          <Button
            styling='primary'
            aria-label={tx('send_message')}
            onClick={onSendMessage}
          >
            {tx('send_message')}
          </Button>
        )}
      </div>
      {statusText != '' && (
        <>
          <div className='group-separator'>
            {tx('pref_default_status_label')}
          </div>
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
        </>
      )}
      {!(isDeviceChat || isSelfChat) && (
        <>
          <div className='group-separator'>{tx('profile_shared_chats')}</div>
          <div
            className='mutual-chats'
            style={{ flexGrow: 1, minHeight: mutualChatsMinHeight }}
          >
            <AutoSizer>
              {({ width, height }) => (
                <ChatListPart
                  isRowLoaded={isChatLoaded}
                  loadMoreRows={loadChats}
                  rowCount={chatListIds.length}
                  width={width}
                  height={height}
                  itemKey={index => 'key' + chatListIds[index]}
                  itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                >
                  {({ index, style }) => {
                    const chatId = chatListIds[index]
                    return (
                      <div style={style}>
                        <ChatListItem
                          chatListItem={chatCache[chatId] || undefined}
                          onClick={onChatClick.bind(null, chatId)}
                        />
                      </div>
                    )
                  }}
                </ChatListPart>
              )}
            </AutoSizer>
          </div>
        </>
      )}
    </>
  )
}
