import React from 'react'
import { useContactSearch } from '../CreateChat'
import { AddMemberInnerDialog } from './AddMemberInnerDialog'
import { useContactsMap } from '../../contact/ContactList'
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
  const [searchContacts, updateSearchContacts] = useContactsMap(listFlags, '')
  const [queryStr, onSearchChange, _, refreshContacts] =
    useContactSearch(updateSearchContacts)
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
        onSearchChange,
        queryStr,
        searchContacts,
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
