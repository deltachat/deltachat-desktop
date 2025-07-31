import React, { useState } from 'react'
import { AddMemberInnerDialog } from './AddMemberInnerDialog'
import { useLazyLoadedContacts } from '../../contact/ContactList'
import Dialog from '../../Dialog'
import Icon from '../../Icon'
import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'
import { Avatar } from '../../Avatar'
import styles from './styles.module.scss'

export function AddMemberDialog({
  onClose,
  onOk,
  groupMembers,
  listFlags,
  titleMembersOrRecipients,
  isVerificationRequired = true,
}: {
  onOk: (members: number[]) => void
  groupMembers: number[]
  listFlags: number
  titleMembersOrRecipients: Parameters<
    typeof AddMemberInnerDialog
  >[0]['titleMembersOrRecipients']
  isVerificationRequired?: boolean
} & DialogProps) {
  const [queryStr, setQueryStr] = useState('')
  const {
    contactIds,
    contactCache,
    loadContacts,
    queryStrIsValidEmail,
    refreshContacts,
  } = useLazyLoadedContacts(listFlags, queryStr, isVerificationRequired)
  return (
    <Dialog
      canOutsideClickClose={false}
      fixed
      onClose={onClose}
      dataTestid='add-member-dialog'
    >
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
        titleMembersOrRecipients,
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
    <div key={contact.id} className={styles.AddMemberChip}>
      <div className={styles.Avatar}>
        <Avatar
          displayName={contact.displayName}
          avatarPath={contact.profileImage}
          color={contact.color}
          small={true}
          // Avatar is purely decorative here,
          // and is redundant accessibility-wise,
          // because we display the contact name below.
          aria-hidden={true}
        />
      </div>
      <div className={styles.DisplayName}>
        <div>{contact.displayName}</div>
      </div>
      <button
        className={styles.removeMember}
        onClick={() => onRemoveClick(contact)}
        aria-label='Remove'
      >
        <Icon className={styles.removeIcon} icon={'cross'} size={12} />
      </button>
    </div>
  )
}
