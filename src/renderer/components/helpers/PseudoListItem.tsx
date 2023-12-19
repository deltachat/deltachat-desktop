import React, { PropsWithChildren, CSSProperties } from 'react'

import { PseudoContact } from '../contact/Contact'
import { QRAvatar } from '../Avatar'
import useTranslationFunction from '../../hooks/useTranslationFunction'

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
