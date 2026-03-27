import React, { useEffect, useState } from 'react'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../../ScreenController'

import styles from './styles.module.scss'
import { Avatar } from '../../Avatar'
import moment from 'moment'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { useRpcFetch } from '../../../hooks/useFetch'
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

type BasicMessageInfoProps = {
  message: T.Message
  info: string
  messageId: number
  onClose: () => void
}

export function BasicMessageInfo(props: BasicMessageInfoProps) {
  const { message } = props
  const tx = useTranslationFunction()
  const receiptsFetch = useMessageReadReceipts(props.messageId)

  const receipts = receiptsFetch.lingeringResult?.ok
    ? receiptsFetch.lingeringResult.value
    : []

  // Format sent timestamp
  const sentTimestamp = moment(message.timestamp * 1000)
  const sentFormatted = sentTimestamp.format('lll')

  // Format received timestamp
  const receivedTimestamp = message.receivedTimestamp
    ? moment(message.receivedTimestamp * 1000)
    : null
  const receivedFormatted = receivedTimestamp
    ? receivedTimestamp.format('lll')
    : null

  return (
    <div className={styles.formattedMessageInfo}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>
          {tx('message_detail_sent_desktop')}
        </span>
        <span className={styles.infoValue}>{sentFormatted}</span>
      </div>
      {receivedFormatted && (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>
            {tx('message_detail_received_desktop')}
          </span>
          <span className={styles.infoValue}>{receivedFormatted}</span>
        </div>
      )}
      {receipts.length > 0 && (
        <>
          <div className={styles.infoRow}>
            <div className={styles.readByHeader}>
              <span className={styles.doubleCheckmarkIcon}></span>
              <strong>{tx('read_by')}</strong>
            </div>
          </div>
          {receipts
            .filter(
              (
                receipt: T.MessageReadReceipt
              ): receipt is T.MessageReadReceipt =>
                receipt.timestamp !== undefined
            )
            .map((receipt: T.MessageReadReceipt) => (
              <ReadReceiptFormatted
                key={receipt.contactId}
                receipt={receipt}
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
  const timeFormatted = time.format('lll')

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
