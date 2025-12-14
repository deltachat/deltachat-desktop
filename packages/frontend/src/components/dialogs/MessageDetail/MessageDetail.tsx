import React from 'react'
import moment from 'moment'

import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import { DialogBody, DialogContent, DialogWithHeader } from '../../Dialog'
import Callout from '../../Callout'

import type { DialogProps } from '../../../contexts/DialogContext'
import { ReadReceiptsList } from './ReadReceipts'

type MessageInfoProps = {
  messageId: number
}

class MessageInfo extends React.Component<
  MessageInfoProps,
  {
    loading: boolean
    content?: string
    receivedAt?: number
    sentAt?: number
    isEdited?: boolean
  }
> {
  constructor(props: MessageInfoProps) {
    super(props)
    this.state = {
      loading: true,
      content: undefined,
      receivedAt: undefined,
      sentAt: undefined,
      isEdited: false,
    }
  }

  componentDidMount() {
    this.refresh()
  }

  async refresh() {
    this.setState({ loading: true })
    const accountId = selectedAccountId()
    const message = await BackendRemote.rpc.getMessage(
      accountId,
      this.props.messageId
    )
    const info = await BackendRemote.rpc.getMessageInfo(
      accountId,
      this.props.messageId
    )
    this.setState({
      loading: false,
      content: info,
      sentAt: (message?.timestamp || 0) * 1000,
      receivedAt: (message?.receivedTimestamp || 0) * 1000,
      isEdited: message?.isEdited,
    })
    this.forceUpdate()
  }

  render() {
    const { receivedAt, sentAt, content, isEdited } = this.state
    const tx = window.static_translate

    return (
      <div className='module-message-detail'>
        <br />
        <ReadReceiptsList messageId={this.props.messageId} />
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
                <td>
                  {moment(sentAt).format('LLLL')}{' '}
                  <span className='module-message-detail__unix-timestamp'>
                    ({sentAt})
                  </span>
                </td>
              </tr>
              {receivedAt ? (
                <tr>
                  <td className='module-message-detail__label'>
                    {tx('message_detail_received_desktop')}
                  </td>
                  <td>
                    {moment(receivedAt).format('LLLL')}{' '}
                    <span className='module-message-detail__unix-timestamp'>
                      ({receivedAt})
                    </span>
                  </td>
                </tr>
              ) : null}
              {this.props.messageId && (
                <tr>
                  <td className='module-message-detail__label'>messageId</td>
                  <td>{this.props.messageId}</td>
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
