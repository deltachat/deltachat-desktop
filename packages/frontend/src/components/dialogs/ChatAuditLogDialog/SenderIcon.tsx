import React from 'react'
import { C, T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../../ScreenController'
import { Avatar } from '../../Avatar'
import { runtime } from '@deltachat-desktop/runtime-interface'
import styles from './styles.module.scss'
import useOpenViewProfileDialog from '../../../hooks/dialog/useOpenViewProfileDialog'

export function SenderIcon({
  contactsCache,
  cachedMessage,
}: {
  contactsCache: Record<T.U32, T.Contact>
  cachedMessage: T.MessageLoadResult & { kind: 'message' }
}) {
  const accountId = selectedAccountId()
  const { systemMessageType, parentId, fromId } = cachedMessage

  let senderIcon = <SystemAvatar />
  if (systemMessageType == 'WebxdcInfoMessage' && parentId) {
    senderIcon = (
      <img
        className={styles.webxdcIcon}
        src={runtime.getWebxdcIconURL(accountId, parentId)}
      />
    )
  } else {
    if (
      fromId > C.DC_CONTACT_ID_LAST_SPECIAL ||
      fromId === C.DC_CONTACT_ID_SELF
    ) {
      // contact or self  sent this
      senderIcon = <ContactAvatar contact={contactsCache[fromId]} />
    }
  }

  return senderIcon
}

function ContactAvatar({ contact }: { contact: T.Contact }) {
  const openViewProfileDialog = useOpenViewProfileDialog()

  if (contact) {
    // TODO we need our own customized design here
    return (
      <Avatar
        avatarPath={contact.profileImage || undefined}
        color={contact.color}
        displayName={contact.displayName}
        addr={contact.address}
        small={true}
        onClick={ev => {
          ev.preventDefault()
          ev.stopPropagation()
          openViewProfileDialog(selectedAccountId(), contact.id)
        }}
      />
    )
  } else {
    // error avatar
    return (
      <Avatar
        avatarPath={undefined}
        color={'red'}
        displayName={'X'}
        small={true}
      />
    )
  }
}

// placeholder icon when sent by system
function SystemAvatar() {
  // TODO make this look nice (maybe dc logo or device messages icon)
  return (
    <Avatar
      avatarPath={undefined}
      color={'grey'}
      displayName={'S'}
      small={true}
    />
  )
}
