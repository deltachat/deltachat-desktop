import React, { useState, useContext, useEffect } from 'react'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogContentTextSeparator,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { useChatList } from '../chat/ChatListHelpers'
import { C } from '@deltachat/jsonrpc-client'
import {
  MessagesDisplayContext,
  ScreenContext,
  useTranslationFunction,
} from '../../contexts'
import { Avatar, ClickForFullscreenAvatarWrapper } from '../Avatar'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import AutoSizer from 'react-virtualized-auto-sizer'
import MessageBody from '../message/MessageBody'
import { useThemeCssVar } from '../../ThemeManager'
import { DialogProps } from './DialogController'
import { Card, Elevation } from '@blueprintjs/core'
import { DeltaInput } from '../Login-Styles'
import { openViewProfileDialog, selectChat } from '../helpers/ChatMethods'
import { BackendRemote, onDCEvent, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import moment from 'moment'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import { getLogger } from '../../../shared/logger'

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

export default function ViewProfile(props: {
  isOpen: boolean
  onClose: () => void
  contact: Type.Contact
  onBack?: () => void
}) {
  const { isOpen, onClose, onBack } = props

  const accountId = selectedAccountId()
  const tx = window.static_translate
  const { openDialog } = useContext(ScreenContext)
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

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader
        title={tx('menu_view_profile')}
        onClickEdit={onClickEdit}
        showEditButton={!(isDeviceChat || isSelfChat)}
        showCloseButton={true}
        onClose={onClose}
        showBackButton={Boolean(onBack)}
        onClickBack={onBack}
      />
      <DeltaDialogBody noFooter>
        <DeltaDialogContent noPadding>
          <ViewProfileInner contact={contact} onClose={onClose} />
        </DeltaDialogContent>
      </DeltaDialogBody>
    </DeltaDialogBase>
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
  const screenContext = useContext(ScreenContext)
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

  const tx = window.static_translate

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
        setVerifier({ label: tx('verified') })
      } else if (contact.verifierId === C.DC_CONTACT_ID_SELF) {
        setVerifier({ label: tx('verified_by_you') })
      } else {
        setVerifier(null) // make sure it rather shows nothing than wrong values
        const verifierContactId = contact.verifierId
        try {
          const { address } = await BackendRemote.rpc.getContact(
            accountId,
            verifierContactId
          )
          setVerifier({
            label: tx('verified_by', address),
            action: () =>
              openViewProfileDialog(screenContext, verifierContactId),
          })
        } catch (error) {
          log.error('failed to load verifier contact', error)
          setVerifier({
            label:
              'verified by: failed to load verifier contact, please report this issue',
            action: () =>
              openViewProfileDialog(screenContext, verifierContactId),
          })
        }
      }
    })()
  }, [accountId, contact.id, contact.verifierId, screenContext, tx])

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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div>
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
                  {displayNameLine}
                  {/* {isVerified && <InlineVerifiedIcon />} */}
                </p>
              </div>
              <div className='address'>{addressLine}</div>
            </div>
          </div>
          {!isSelfChat && (
            <div className='contact-attributes'>
              {contact.isVerified && verifier && (
                <div
                  className={verifier.action && 'clickable'}
                  onClick={verifier.action}
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
              <DeltaDialogContentTextSeparator
                text={tx('pref_default_status_label')}
              />
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
            <DeltaDialogContentTextSeparator
              text={tx('profile_shared_chats')}
            />
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
      </div>
    </>
  )
}

export function EditContactNameDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  contactName: initialGroupName,
}: DialogProps) {
  const [contactName, setContactName] = useState(initialGroupName)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
    onCancel && onCancel()
  }
  const onClickOk = () => {
    onClose()
    onOk(contactName)
  }
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        top: '15vh',
        width: '500px',
        maxHeight: '70vh',
        height: 'auto',
      }}
      fixed
    >
      <DeltaDialogHeader title={tx('menu_edit_name')} />
      <DeltaDialogBody>
        <Card elevation={Elevation.ONE}>
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
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}
