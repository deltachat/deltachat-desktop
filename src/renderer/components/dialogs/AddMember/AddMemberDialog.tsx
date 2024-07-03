import React, { useState } from 'react'
import { AddMemberInnerDialog } from './AddMemberInnerDialog'
import { useLazyLoadedContacts } from '../../contact/ContactList'
import Dialog from '../../Dialog'
import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'
import { InlineVerifiedIcon } from '../../VerifiedIcon'
import { Avatar } from '../../Avatar'

export function AddMemberDialog({
  onClose,
  onOk,
  groupMembers,
  listFlags,
  isBroadcast = false,
  isVerificationRequired = false,
}: {
  onOk: (members: number[]) => void
  groupMembers: number[]
  listFlags: number
  isBroadcast?: boolean
  isVerificationRequired?: boolean
} & DialogProps) {
  const [queryStr, setQueryStr] = useState('')
  const {
    contactIds,
    contactCache,
    loadContacts,
    queryStrIsValidEmail,
    refresh: refreshContacts,
  } = useLazyLoadedContacts(listFlags, queryStr)
  return (
    <Dialog canOutsideClickClose={false} fixed onClose={onClose}>
      {AddMemberInnerDialog({
        onOk: addMembers => {
          onOk(addMembers)
          onClose()
        },
        onCancel: () => {
          onClose()
        },
        onSearchChange: e => setQueryStr(e.target.value),
        queryStr,
        queryStrIsValidEmail,

        contactIds,
        contactCache,
        loadContacts,
        refreshContacts,

        groupMembers,
        isBroadcast,
        isVerificationRequired,
      })}
    </Dialog>
  )
}

export const AddMemberChip = (props: {
  contact: T.Contact
  onRemoveClick: (contact: T.Contact) => void
}) => {
  const { contact, onRemoveClick } = props
  return (
    <div
      key={contact.id}
      className='AddMemberChip'
      onClick={() => onRemoveClick(contact)}
    >
      <div className='Avatar'>
        <Avatar
          displayName={contact.displayName}
          avatarPath={contact.profileImage}
          color={contact.color}
        />
      </div>
      <div className='DisplayName'>
        {contact.displayName} {contact.isVerified && <InlineVerifiedIcon />}
      </div>
    </div>
  )
}
