import React from 'react'
import DeltaDialog, { DeltaDialogBody } from './DeltaDialog'
import moment from 'moment'
import { DeltaBackend } from '../../delta-remote'
import { Card, Callout } from '@blueprintjs/core'
import { DialogProps } from './DialogController'

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
  }
> {
  constructor(props: MessageInfoProps) {
    super(props)
    this.state = {
      loading: true,
      content: undefined,
      receivedAt: undefined,
      sentAt: undefined,
    }
  }

  componentDidMount() {
    this.refresh()
  }

  async refresh() {
    this.setState({ loading: true })
    const message = await DeltaBackend.call(
      'messageList.getMessage',
      this.props.messageId
    )
    const info = await DeltaBackend.call(
      'messageList.getMessageInfo',
      this.props.messageId
    )
    this.setState({
      loading: false,
      content: info,
      sentAt: (message?.timestamp || 0) * 1000,
      receivedAt: (message?.receivedTimestamp || 0) * 1000,
    })
    this.forceUpdate()
  }

  render() {
    const { receivedAt, sentAt, content } = this.state
    const tx = window.static_translate

    return (
      <div className='module-message-detail'>
        <Callout>
          <p>{content}</p>
        </Callout>
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
          </tbody>
        </table>
      </div>
    )
  }
}

export default function MessageDetail(props: {
  id: number
  onClose: DialogProps['onClose']
}) {
  const { id, onClose } = props
  const isOpen = !!id
  const tx = window.static_translate

  let body = <div />
  if (isOpen) {
    body = (
      <Card>
        <MessageInfo messageId={id} />
      </Card>
    )
  }

  return (
    <DeltaDialog
      title={tx('menu_message_details')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <DeltaDialogBody noFooter>{body}</DeltaDialogBody>
    </DeltaDialog>
  )
}
