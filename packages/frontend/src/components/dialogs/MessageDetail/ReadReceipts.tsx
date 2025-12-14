import React, { useEffect, useState } from 'react'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../../ScreenController'

import styles from './styles.module.scss'
import { Avatar } from '../../Avatar'
import moment from 'moment'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { useRpcFetch } from '../../../hooks/useFetch'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'
type ReadReceiptsListProps = { messageId: number }

export function ReadReceiptsList(props: ReadReceiptsListProps) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const receiptsFetch = useRpcFetch(BackendRemote.rpc.getMessageReadReceipts, [
    accountId,
    props.messageId,
  ])
  const refresh = receiptsFetch.refresh
  useEffect(
    () =>
      onDCEvent(accountId, 'MsgRead', ({ msgId }) => {
        if (msgId === props.messageId) {
          refresh()
        }
      }),
    [accountId, props.messageId, refresh]
  )
  if (receiptsFetch.lingeringResult?.ok === false) {
    return tx(
      'error_x',
      `Failed to fetch read receipts:\n${unknownErrorToString(receiptsFetch.lingeringResult.err)}`
    )
  }
  const receipts = receiptsFetch.lingeringResult?.value
  if (!receipts) {
    return null
  }

  if (receipts.length === 0) {
    return null
  }
  return (
    <div className={styles.ReadReceiptsContainer}>
      <div className={styles.Heading}>
        <div className={styles.DoubleCheckmarkIcon}></div>
        {tx('read_by')}
      </div>
      <ul className={styles.ReadReceiptBox}>
        {receipts.map(receipt => (
          <li key={receipt.contactId}>
            <ReadReceipt receipt={receipt} />
          </li>
        ))}
      </ul>
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
        // Avatar is purely decorative here,
        // and is redundant accessibility-wise,
        // because we display the contact name below.
        aria-hidden={true}
      />
      <div className={styles.ReadReceiptContactLabel}>
        <div>
          <span className='truncated'>
            <b>{contact.displayName}</b>
          </span>{' '}
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
