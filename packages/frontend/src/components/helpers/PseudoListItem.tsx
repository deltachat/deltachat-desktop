import React, {
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
} from 'react'

import { PseudoContact } from '../contact/Contact'
import { QRAvatar } from '../Avatar'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useSettingsStore } from '../../stores/settings'
import useProcessQR from '../../hooks/useProcessQr'
import { BackendRemote } from '../../backend-com'
import { T } from '@deltachat/jsonrpc-client'

export function PseudoListItem(
  props: PropsWithChildren<{
    id: string
    /** replacement for avatar letter */
    cutoff?: string
    text: string
    subText?: string
    onClick?: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    style?: CSSProperties
  }>
) {
  const { id, cutoff, text, subText, onClick, style } = props
  return (
    <div
      className='contact-list-item'
      id={id}
      key={id}
      onClick={onClick}
      style={style}
    >
      <PseudoContact cutoff={cutoff} text={text} subText={subText}>
        {props.children}
      </PseudoContact>
    </div>
  )
}

export const PseudoListItemNoSearchResults = ({
  queryStr,
}: {
  queryStr: string
}) => {
  const tx = useTranslationFunction()
  return (
    <PseudoListItem
      id='addmember'
      text={tx('search_no_result_for_x', queryStr)}
    >
      <div className='avatar no-search-results'>
        <div className='content'></div>
      </div>
    </PseudoListItem>
  )
}

export const PseudoListItemShowQrCode = ({
  onClick,
}: {
  onClick: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}) => {
  const tx = useTranslationFunction()
  return (
    <PseudoListItem id='showqrcode' text={tx('qrshow_title')} onClick={onClick}>
      <QRAvatar />
    </PseudoListItem>
  )
}

export const PseudoListItemAddMember = ({
  onClick,
  isBroadcast = false,
}: {
  onClick: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  isBroadcast?: boolean
}) => {
  const tx = useTranslationFunction()
  return (
    <PseudoListItem
      id='addmember'
      cutoff='+'
      text={!isBroadcast ? tx('group_add_members') : tx('add_recipients')}
      onClick={onClick}
    />
  )
}

export const PseudoListItemAddContact = ({
  queryStr,
  queryStrIsEmail,
  onClick,
}: {
  queryStr: string
  queryStrIsEmail: boolean
  onClick: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}) => {
  const tx = window.static_translate // static_translate because the context method produced sometimes an 'Invalid hook call' crash

  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.is_chatmail === '1'

  return (
    <PseudoListItem
      id='newcontact'
      cutoff='+'
      text={
        isChatmail ? tx('menu_new_classic_contact') : tx('menu_new_contact')
      }
      subText={
        queryStrIsEmail ? queryStr + ' ...' : tx('contacts_type_email_above')
      }
      onClick={onClick}
    />
  )
}

export const PseudoListItemAddContactOrGroupFromInviteLink = ({
  inviteLink,
  accountId,
}: {
  inviteLink: string
  accountId: number
}) => {
  const tx = useTranslationFunction()
  const processQr = useProcessQR()
  const inviteLinkTrimmed = inviteLink.trim()

  const [parsedQr, setParsedQr] = useState<null | T.Qr>(null)
  useEffect(() => {
    setParsedQr(null)
    let outdated = false

    BackendRemote.rpc
      .checkQr(accountId, inviteLinkTrimmed)
      .then(qr => {
        if (!outdated) {
          setParsedQr(qr)
        }
      })
      .catch(() => {
        if (!outdated) {
          setParsedQr(null)
        }
      })

    return () => {
      outdated = true
    }
  }, [accountId, inviteLinkTrimmed])

  const [contactName, setContactName] = useState<'' | T.Contact['displayName']>(
    ''
  )
  useEffect(() => {
    setContactName('')

    if (parsedQr?.kind !== 'askVerifyContact') {
      return
    }

    let outdated = false

    BackendRemote.rpc
      .getContact(accountId, parsedQr.contact_id)
      .then(contact => {
        if (!outdated) {
          setContactName(contact.displayName)
        }
      })

    return () => {
      outdated = true
    }
  }, [accountId, parsedQr])

  return (
    <PseudoListItem
      id='newcontactorgroupfrominvitelink'
      cutoff='+'
      text={
        parsedQr?.kind === 'askVerifyGroup' ? parsedQr.grpname : contactName
      }
      subText={
        parsedQr?.kind === 'askVerifyGroup'
          ? tx('menu_new_group')
          : tx('menu_new_contact')
      }
      onClick={() => processQr(accountId, inviteLinkTrimmed)}
    />
  )
}
