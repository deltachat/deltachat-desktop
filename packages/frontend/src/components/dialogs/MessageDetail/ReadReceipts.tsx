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
import useOpenViewProfileDialog from '../../../hooks/dialog/useOpenViewProfileDialog'

function useMessageReadReceipts(messageId: number) {
  const accountId = selectedAccountId()
  const receiptsFetch = useRpcFetch(BackendRemote.rpc.getMessageReadReceipts, [
    accountId,
    messageId,
  ])
  const refresh = receiptsFetch.refresh

  useEffect(
    () =>
      onDCEvent(accountId, 'MsgRead', ({ msgId }) => {
        if (msgId === messageId) {
          refresh()
        }
      }),
    [accountId, messageId, refresh]
  )

  return receiptsFetch
}

type ReadReceiptsListProps = { messageId: number }

type FormattedMessageInfoProps = {
  message: T.Message
  info: string
  messageId: number
  onClose: () => void
}

export function FormattedMessageInfo(props: FormattedMessageInfoProps) {
  const { message } = props
  const _tx = useTranslationFunction()
  const receiptsFetch = useMessageReadReceipts(props.messageId)

  const receipts = receiptsFetch.lingeringResult?.ok
    ? receiptsFetch.lingeringResult.value
    : []

  // Format sent timestamp
  const sentTimestamp = moment(message.timestamp * 1000)
  const sentFormatted = sentTimestamp.format('L LT')

  // Format received timestamp
  const receivedTimestamp = message.receivedTimestamp
    ? moment(message.receivedTimestamp * 1000)
    : null
  const receivedFormatted = receivedTimestamp
    ? receivedTimestamp.format('L LT')
    : null

  return (
    <div className={styles.formattedMessageInfo}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>
          {_tx('message_detail_sent_desktop')}
        </span>
        <span className={styles.infoValue}>{sentFormatted}</span>
      </div>
      {receivedFormatted && (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>
            {_tx('message_detail_received_desktop')}
          </span>
          <span className={styles.infoValue}>{receivedFormatted}</span>
        </div>
      )}
      {receipts.length > 0 && (
        <>
          <div className={styles.infoRow}>
            <div className={styles.readByHeader}>
              <span className={styles.doubleCheckmarkIcon}></span>
              <strong>{_tx('read_by')}</strong>
            </div>
          </div>
          {receipts
            .filter(
              (
                receipt: T.MessageReadReceipt
              ): receipt is T.MessageReadReceipt =>
                receipt.timestamp !== undefined
            )
            .map((receipt: T.MessageReadReceipt, index: number) => (
              <ReadReceiptFormatted
                key={receipt.contactId}
                receipt={receipt}
                index={index}
                onAction={props.onClose}
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
  onAction?: () => void
}) {
  const accountId = selectedAccountId()
  const [contact, setContact] = useState<T.Contact | null>(null)
  const openViewProfileDialog = useOpenViewProfileDialog({
    onAction: props.onAction,
  })

  useEffect(() => {
    BackendRemote.rpc
      .getContact(accountId, props.receipt.contactId)
      .then(setContact)
  }, [props.receipt.contactId, accountId])

  const time = moment(props.receipt.timestamp * 1000)
  const timeFormatted = time.format('L LT')

  if (!contact) {
    return null
  }

  return (
    <button
      type='button'
      className={styles.readReceiptFormatted}
      onClick={() => openViewProfileDialog(accountId, props.receipt.contactId)}
    >
      <div className={styles.readReceiptLeft}>
        <Avatar
          small
          displayName={contact.displayName}
          avatarPath={contact.profileImage}
          addr={contact.address}
          color={contact.color}
          aria-hidden={true}
        />
        <span className={styles.contactName}>{contact.displayName}</span>
      </div>
      <span className={styles.infoValue}>{timeFormatted}</span>
    </button>
  )
}

export function ReadReceiptsList(props: ReadReceiptsListProps) {
  const tx = useTranslationFunction()
  const receiptsFetch = useMessageReadReceipts(props.messageId)

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
    <div className={styles.readReceiptsContainer}>
      <div className={styles.heading}>
        <div className={styles.doubleCheckmarkIcon}></div>
        {tx('read_by')}
      </div>
      <ul className={styles.readReceiptBox}>
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
    <div className={styles.readReceipt}>
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
      <div className={styles.readReceiptContactLabel}>
        <div>
          <span className='truncated'>
            <b>{contact.displayName}</b>
          </span>{' '}
        </div>
        {!contact.isVerified && (
          <div className={styles.contactEmail}>{contact.address}</div>
        )}
      </div>
      <div>
        <span className={styles.date}>{time.format('L')}</span>{' '}
        {time.format('LT')}
      </div>
    </div>
  )
}
