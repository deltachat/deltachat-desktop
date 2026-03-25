import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import { DialogBody, DialogContent, DialogWithHeader } from '../../Dialog'
import Callout from '../../Callout'

import type { DialogProps } from '../../../contexts/DialogContext'
import { ReadReceiptsList } from './ReadReceipts'

function MessageInfo({ messageId }: { messageId: number }) {
  const [content, setContent] = useState<string | undefined>()
  const [receivedAt, setReceivedAt] = useState<number | undefined>()
  const [sentAt, setSentAt] = useState<number | undefined>()
  const [isEdited, setIsEdited] = useState(false)

  const tx = window.static_translate

  useEffect(() => {
    const accountId = selectedAccountId()
    async function refresh() {
      const message = await BackendRemote.rpc.getMessage(accountId, messageId)
      const info = await BackendRemote.rpc.getMessageInfo(accountId, messageId)
      setContent(info)
      setSentAt((message?.timestamp || 0) * 1000)
      setReceivedAt((message?.receivedTimestamp || 0) * 1000)
      setIsEdited(message?.isEdited ?? false)
    }
    refresh()
  }, [messageId])

  return (
    <div className='module-message-detail'>
      <br />
      <ReadReceiptsList messageId={messageId} />
      <Callout>
        <p>{content}</p>
      </Callout>
      <br />
      <DialogContent>
        <table className='module-message-detail__info'>
          <tbody>
            <tr>
              <td className='module-message-detail__label'>
                {tx('message_detail_sent_desktop')}
              </td>
              <td>{moment(sentAt).format('LLLL')}</td>
            </tr>
            {receivedAt ? (
              <tr>
                <td className='module-message-detail__label'>
                  {tx('message_detail_received_desktop')}
                </td>
                <td>{moment(receivedAt).format('LLLL')}</td>
              </tr>
            ) : null}
            {messageId && (
              <tr>
                <td className='module-message-detail__label'>messageId</td>
                <td>{messageId}</td>
              </tr>
            )}
            {isEdited && (
              <tr>
                <td className='module-message-detail__label'>
                  {tx('edited')}
                </td>
                <td>{tx('yes')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </DialogContent>
    </div>
  )
}

export default function MessageDetail(
  props: {
    id: number
  } & DialogProps
) {
  const { id, onClose } = props
  const isOpen = !!id
  const tx = window.static_translate

  let body = <div />
  if (isOpen) {
    body = <MessageInfo messageId={id} />
  }

  return (
    <DialogWithHeader title={tx('menu_message_details')} onClose={onClose}>
      <DialogBody>{body}</DialogBody>
    </DialogWithHeader>
  )
}
