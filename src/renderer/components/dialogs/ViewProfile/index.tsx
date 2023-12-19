import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { C } from '@deltachat/jsonrpc-client'

import ChatListItem from '../../chat/ChatListItem'
import { useChatList } from '../../chat/ChatListHelpers'
import { Avatar, ClickForFullscreenAvatarWrapper } from '../../Avatar'
import { useLogicVirtualChatList, ChatListPart } from '../../chat/ChatList'
import MessageBody from '../../message/MessageBody'
import { useThemeCssVar } from '../../../ThemeManager'
import { DeltaInput } from '../../Login-Styles'
import { openViewProfileDialog, selectChat } from '../../helpers/ChatMethods'
import { BackendRemote, onDCEvent, Type } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { InlineVerifiedIcon } from '../../VerifiedIcon'
import { getLogger } from '../../../../shared/logger'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/useDialog'
import { MessagesDisplayContext } from '../../../contexts/MessagesDisplayContext'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'

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

function ProfileInfoAvatar({ contact }: { contact: Type.Contact }) {
  const { displayName, profileImage, wasSeenRecently } = contact
  const color = contact.color
  return Avatar({
    avatarPath: profileImage,
    color,
    displayName,
    large: true,
    wasSeenRecently,
  })
}

export default function ViewProfile(
  props: {
    contact: Type.Contact
    onBack?: () => void
  } & DialogProps
) {
  const { onClose, onBack } = props

  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const [contact, setContact] = useState<Type.Contact>(props.contact)
  const isDeviceChat = contact.id === C.DC_CONTACT_ID_DEVICE
  const isSelfChat = contact.id === C.DC_CONTACT_ID_SELF

  const onClickEdit = () => {
    openDialog(EditContactNameDialog, {
      contactName: contact.name,
      onOk: async (contactName: string) => {
        await BackendRemote.rpc.changeContactName(
          accountId,
          contact.id,
          contactName
        )
      },
    })
  }

  useEffect(() => {
    return onDCEvent(accountId, 'ContactsChanged', () => {
      BackendRemote.rpc.getContact(accountId, contact.id).then(setContact)
    })
  }, [accountId, contact.id])

  const showEditButton = !(isDeviceChat || isSelfChat)

  return (
    <Dialog
      width={400}
      onClose={onClose}
      fixed
      className={styles.viewProfileDialog}
    >
      <DialogHeader
        title={tx('contact')}
        onClickEdit={showEditButton ? onClickEdit : undefined}
        onClose={onClose}
        onClickBack={onBack}
      />
      <DialogBody className={styles.viewProfileDialogBody}>
        <ViewProfileInner contact={contact} onClose={onClose} />
      </DialogBody>
    </Dialog>
  )
}

export function ViewProfileInner({
  contact,
  onClose,
}: {
  contact: Type.Contact
  onClose: () => void
}) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { chatListIds } = useChatList(null, '', contact.id)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    null
  )
  const [selfChatAvatar, setSelfChatAvatar] = useState<string | null>(null)
  const [verifier, setVerifier] = useState<null | {
    label: string
    action?: () => void
  }>(null)

  const isDeviceChat = contact.id === C.DC_CONTACT_ID_DEVICE
  const isSelfChat = contact.id === C.DC_CONTACT_ID_SELF

  const onChatClick = (chatId: number) => {
    selectChat(chatId)
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
          const { nameAndAddr } = await BackendRemote.rpc.getContact(
            accountId,
            verifierContactId
          )
          setVerifier({
            label: tx('verified_by', nameAndAddr),
            action: () => openViewProfileDialog(openDialog, verifierContactId),
          })
        } catch (error) {
          log.error('failed to load verifier contact', error)
          setVerifier({
            label:
              'verified by: failed to load verifier contact, please report this issue',
            action: () => openViewProfileDialog(openDialog, verifierContactId),
          })
        }
      }
    })()
  }, [accountId, contact.id, contact.verifierId, openDialog, tx])

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  let displayNameLine = contact.displayName
  let addressLine = contact.address
  let statusText = contact.status

  if (isDeviceChat) {
    addressLine = tx('device_talk_subtitle')
  } else if (isSelfChat) {
    displayNameLine = tx('saved_messages')
    addressLine = tx('chat_self_talk_subtitle')
    statusText = tx('saved_messages_explain')
  }

  return (
    <>
      <div>
        <DialogContent>
          <div className='profile-info-container'>
            <ClickForFullscreenAvatarWrapper
              filename={isSelfChat ? selfChatAvatar : contact.profileImage}
            >
              {isSelfChat ? (
                <ProfileInfoAvatar
                  contact={{ ...contact, profileImage: selfChatAvatar }}
                />
              ) : (
                <ProfileInfoAvatar contact={contact} />
              )}
            </ClickForFullscreenAvatarWrapper>
            <div className='profile-info-name-container'>
              <div>
                <p className='group-name'>
                  <span className='trucated-name'>{displayNameLine}</span>
                  {contact.isProfileVerified && <InlineVerifiedIcon />}
                </p>
              </div>
              <div className='address'>{addressLine}</div>
            </div>
          </div>
          {!isSelfChat && (
            <div className='contact-attributes'>
              {verifier && (
                <div
                  className={verifier.action && 'clickable'}
                  onClick={verifier.action}
                  style={{ display: 'flex' }}
                >
                  <InlineVerifiedIcon />
                  {verifier.label}
                </div>
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
            <button
              aria-label={tx('send_message')}
              onClick={onSendMessage}
              className={'delta-button-round'}
              style={{ marginTop: '0px' }}
            >
              {tx('send_message')}
            </button>
          )}
        </div>
        {statusText != '' && (
          <>
            <div className='group-separator'>
              {tx('pref_default_status_label')}
            </div>
            <div className='status-text'>
              <MessagesDisplayContext.Provider
                value={{
                  context: 'contact_profile_status',
                  contact_id: contact.id,
                  closeProfileDialog: onClose,
                }}
              >
                <MessageBody text={statusText} />
              </MessagesDisplayContext.Provider>
            </div>
          </>
        )}
      </div>
      {!(isDeviceChat || isSelfChat) && (
        <>
          <div className='group-separator'>{tx('profile_shared_chats')}</div>
          <div className='mutual-chats' style={{ flexGrow: 1 }}>
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

export function EditContactNameDialog({
  onClose,
  onOk,
  contactName: initialGroupName,
}: {
  onOk: (contactName: string) => void
  contactName: string
} & DialogProps) {
  const [contactName, setContactName] = useState(initialGroupName)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
  }

  const onClickOk = () => {
    onClose()
    onOk(contactName)
  }

  return (
    <Dialog canOutsideClickClose={false} fixed onClose={onClose}>
      <DialogHeader title={tx('menu_edit_name')} />
      <DialogBody>
        <DialogContent>
          <DeltaInput
            key='contactname'
            id='contactname'
            placeholder={tx('name_desktop')}
            value={contactName}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setContactName(event.target.value)
            }}
          />
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClickCancel} onOk={onClickOk} />
    </Dialog>
  )
}
