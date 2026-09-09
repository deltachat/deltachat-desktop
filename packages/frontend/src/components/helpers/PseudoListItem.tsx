import React, { PropsWithChildren, CSSProperties, useRef } from 'react'

import { PseudoContact } from '../contact/Contact'
import { AvatarFromContact, QRAvatar } from '../Avatar'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useSettingsStore } from '../../stores/settings'
import useProcessQR from '../../hooks/useProcessQr'
import { useRovingTabindex } from '../../contexts/RovingTabindex'
import { SCAN_CONTEXT_TYPE } from '../../hooks/useProcessQr'

import type { QrSearchResult } from '../../hooks/useQrSearchResult'

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
}: {
  onClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) => {
  const tx = useTranslationFunction()
  return (
    <PseudoListItem
      id='addmember'
      cutoff='+'
      text={tx('group_add_members')}
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
  const forceEncryption = settingsStore?.settings.force_encryption !== '0'

  if (forceEncryption) return null

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

/**
 * A search result for a query that is a QR code / URI, e.g. an invite link.
 *
 * @see `useQrSearchResult`
 */
export const PseudoListItemQrSearchResult = ({
  result,
  accountId,
  callback,
}: {
  result: QrSearchResult
  accountId: number
  callback?: () => void
}) => {
  const tx = useTranslationFunction()
  const processQr = useProcessQR()

  const onClick = () => {
    processQr(accountId, result.qrContent, SCAN_CONTEXT_TYPE.DEFAULT)
    callback?.()
  }

  return result.type === 'contact' ? (
    <PseudoListItem
      id='newcontactfrominvitelink'
      text={result.contact.displayName}
      subText={tx('start_chat')}
      onClick={onClick}
    >
      <AvatarFromContact contact={result.contact} aria-hidden={true} />
    </PseudoListItem>
  ) : (
    <PseudoListItem
      id={result.id}
      cutoff='+'
      text={result.text}
      subText={result.subText}
      onClick={onClick}
    >
      {result.qrAvatar && <QRAvatar />}
    </PseudoListItem>
  )
}
