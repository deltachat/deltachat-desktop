import React, { useEffect, useState } from 'react'
import { BackendRemote } from '../../../backend-com'
import { T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../../ScreenController'

import styles from './styles.module.scss'
import { Avatar } from '../../Avatar'
import { InlineVerifiedIcon } from '../../VerifiedIcon'
import moment from 'moment'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
type ReadReceiptsListProps = { messageId: number }

export function ReadReceiptsList(props: ReadReceiptsListProps) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const [receipts, setReceipts] = useState<T.MessageReadReceipt[]>([])
  useEffect(() => {
    BackendRemote.rpc
      .getMessageReadReceipts(accountId, props.messageId)
      .then(setReceipts)
  }, [props.messageId, accountId])

  if (receipts.length === 0) {
    return null
  }
  return (
    <div className={styles.ReadReceiptsContainer}>
      <div className={styles.Heading}>
        <div className={styles.DoubleCheckmarkIcon}></div>
        {tx('pref_read_receipts')}
      </div>
      <div className={styles.ReadReceiptBox}>
        {receipts.map(receipt => (
          <ReadReceipt receipt={receipt} />
        ))}
      </div>
    </div>
  )
}

function ReadReceipt(props: { receipt: T.MessageReadReceipt }) {
  const accountId = selectedAccountId()
  const [contact, setContact] = useState<T.Contact | null>(null)

  useEffect(() => {
    BackendRemote.rpc
      .getContact(accountId, props.receipt.contactId)
      .then(setContact)
  }, [props.receipt.contactId, accountId])

  const time = moment(props.receipt.timestamp * 1000)

  if (!contact) {
    return null
  }
  return (
    <div className={styles.ReadReceipt}>
      <Avatar
        small
        displayName={contact.displayName}
        avatarPath={contact.profileImage}
        addr={contact.address}
        color={contact.color}
      />
      <div className={styles.ReadReceiptContactLabel}>
        <div>
          <span className='truncated'>
            <b>{contact.displayName}</b>
          </span>{' '}
          {contact.isVerified && <InlineVerifiedIcon />}
        </div>
        {!contact.isVerified && (
          <div className={styles.ContactEmail}>{contact.address}</div>
        )}
      </div>
      <div>
        <span className={styles.Date}>{time.format('L')}</span>{' '}
        {time.format('LT')}
      </div>
    </div>
  )
}
