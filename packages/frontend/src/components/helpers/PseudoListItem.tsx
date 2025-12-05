import React, { PropsWithChildren, CSSProperties, useRef } from 'react'

import { PseudoContact } from '../contact/Contact'
import { QRAvatar } from '../Avatar'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useSettingsStore } from '../../stores/settings'
import useProcessQR from '../../hooks/useProcessQr'
import { BackendRemote } from '../../backend-com'
import { ContactListItem } from '../contact/ContactListItem'
import { useRovingTabindex } from '../../contexts/RovingTabindex'
import { useRpcFetch } from '../../hooks/useFetch'
import { SCAN_CONTEXT_TYPE } from '../../hooks/useProcessQr'

export function PseudoListItem(
  props: PropsWithChildren<{
    id: string
    /** replacement for avatar letter */
    cutoff?: string
    text: string
    subText?: string
    onClick?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    style?: CSSProperties
  }>
) {
  const { id, cutoff, text, subText, onClick, style } = props

  const buttonRef = useRef(null)
  const rovingTabindex = useRovingTabindex(buttonRef)

  return (
    <div className='contact-list-item' id={id} key={id}>
      <button
        type='button'
        ref={buttonRef}
        className={'contact-list-item-button ' + rovingTabindex.className}
        onClick={onClick}
        // Keep in mind that `tabIndex="0"` will _not_
        // make the element focusable.
        disabled={!onClick}
        style={style}
        tabIndex={rovingTabindex.tabIndex}
        onFocus={rovingTabindex.setAsActiveElement}
        onKeyDown={rovingTabindex.onKeydown}
        data-testid={id}
      >
        <PseudoContact cutoff={cutoff} text={text} subText={subText}>
          {props.children}
        </PseudoContact>
      </button>
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
  onClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
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
  labelMembersOrRecipients,
}: {
  onClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  labelMembersOrRecipients: 'members' | 'recipients'
}) => {
  const tx = useTranslationFunction()
  return (
    <PseudoListItem
      id='addmember'
      cutoff='+'
      text={
        labelMembersOrRecipients === 'members'
          ? tx('group_add_members')
          : tx('add_recipients')
      }
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
  onClick:
    | undefined
    | ((ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
}) => {
  const tx = window.static_translate // static_translate because the context method produced sometimes an 'Invalid hook call' crash

  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.is_chatmail === '1'

  if (isChatmail) return null

  return (
    <PseudoListItem
      id='newcontact'
      cutoff='+'
      text={tx('menu_new_contact')}
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
  callback,
}: {
  inviteLink: string
  accountId: number
  callback?: () => void
}) => {
  const tx = useTranslationFunction()
  const processQr = useProcessQR()
  const inviteLinkTrimmed = inviteLink.trim()

  const parsedQrFetch = useRpcFetch(BackendRemote.rpc.checkQr, [
    accountId,
    inviteLink,
  ])
  const parsedQr = parsedQrFetch.result?.ok ? parsedQrFetch.result.value : null
  const contactFetch = useRpcFetch(
    BackendRemote.rpc.getContact,
    parsedQr && parsedQr.kind === 'askVerifyContact'
      ? [accountId, parsedQr.contact_id]
      : null
  )
  const contact = contactFetch?.result?.ok ? contactFetch.result.value : null

  const onClick = () => {
    processQr(accountId, inviteLinkTrimmed, SCAN_CONTEXT_TYPE.DEFAULT)
    callback?.()
  }

  return contact ? (
    <ContactListItem
      tagName='div'
      showCheckbox={false}
      checked={false}
      showRemove={false}
      contact={contact}
      onClick={onClick}
    />
  ) : parsedQr?.kind === 'askVerifyGroup' ? (
    <PseudoListItem
      id='newgroupfrominvitelink'
      cutoff='+'
      text={parsedQr.grpname}
      subText={tx('join_group')}
      onClick={onClick}
    />
  ) : (
    // There are many kinds of QRs. For example, if you paste an invite link
    // of a group that you created yourself, you'll get
    // `parsedQr.kind === "withdrawVerifyGroup"`.
    // TODO we probably want to better handle such cases.
    <PseudoListItem
      id='otherinvitelinkaction'
      cutoff='+'
      text={tx('menu_new_contact')}
      subText={undefined}
      onClick={onClick}
    />
  )
}
