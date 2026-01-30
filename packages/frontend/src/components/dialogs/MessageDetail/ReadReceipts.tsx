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

type FormattedMessageInfoProps = {
  message: T.Message
  info: string
  messageId: number
}

export function FormattedMessageInfo(props: FormattedMessageInfoProps) {
  const { message, info } = props
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

  const receipts = receiptsFetch.lingeringResult?.value || []

  // Parse info string to extract read timestamps
  const readLines = info.split('\n').filter(line => line.startsWith('Read:'))
  const parsedReadReceipts = readLines
    .map(line => {
      const match = line.match(
        /Read: (\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}) by (.+?) \((.+?)\)/
      )
      if (match) {
        const timestamp = moment(match[1], 'YYYY.MM.DD HH:mm:ss')
        return {
          name: match[2],
          email: match[3],
          timestamp,
        }
      }
      return null
    })
    .filter(Boolean)

  // Format sent timestamp
  const sentTimestamp = moment(message.timestamp * 1000)
  const sentFormatted = sentTimestamp.format('YYYY-MM-DD HH:mm')

  // Format received timestamp
  const receivedTimestamp = message.receivedTimestamp
    ? moment(message.receivedTimestamp * 1000)
    : null
  const receivedFormatted = receivedTimestamp
    ? receivedTimestamp.format('YYYY-MM-DD HH:mm')
    : null

  return (
    <div className={styles.FormattedMessageInfo}>
      <div className={styles.InfoRow}>
        <span className={styles.InfoLabel}>Sent</span>
        <span className={styles.InfoValue}>{sentFormatted}</span>
      </div>
      {receivedFormatted && (
        <div className={styles.InfoRow}>
          <span className={styles.InfoLabel}>Received</span>
          <span className={styles.InfoValue}>{receivedFormatted}</span>
        </div>
      )}
      {receipts.length > 0 && (
        <>
          <div className={styles.InfoRow}>
            <div className={styles.ReadByHeader}>
              <span className={styles.DoubleCheckmarkIcon}></span>
              <strong>Read By</strong>
            </div>
          </div>
          {receipts.map((receipt, index) => (
            <ReadReceiptFormatted
              key={receipt.contactId}
              receipt={receipt}
              index={index}
            />
          ))}
        </>
      )}
    </div>
  )
}

function ReadReceiptFormatted(props: {
  receipt: T.MessageReadReceipt
  index: number
}) {
  const accountId = selectedAccountId()
  const [contact, setContact] = useState<T.Contact | null>(null)

  useEffect(() => {
    BackendRemote.rpc
      .getContact(accountId, props.receipt.contactId)
      .then(setContact)
  }, [props.receipt.contactId, accountId])

  const time = moment(props.receipt.timestamp * 1000)
  const timeFormatted = time.format('YYYY-MM-DD HH:mm')

  if (!contact) {
    return null
  }

  return (
    <div className={styles.ReadReceiptFormatted}>
      <div className={styles.ReadReceiptLeft}>
        <Avatar
          small
          displayName={contact.displayName}
          avatarPath={contact.profileImage}
          addr={contact.address}
          color={contact.color}
          aria-hidden={true}
        />
        <span className={styles.ContactName}>{contact.displayName}</span>
      </div>
      <span className={styles.InfoValue}>{timeFormatted}</span>
    </div>
  )
}

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
