import React from 'react'
import { convertContactProps } from '../contact/Contact'
import DeltaDialog, { DeltaDialogBody } from './DeltaDialog'
import moment from 'moment'
import { DeltaBackend } from '../../delta-remote'
import { Card, Callout } from '@blueprintjs/core'
import { MessageType } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'

type MessageInfoProps = {
  messageId: number
  receivedAt: number
  sentAt: number
}

class MessageInfo extends React.Component<
  MessageInfoProps,
  {
    loading: boolean
    content: string
  }
> {
  constructor(props: MessageInfoProps) {
    super(props)
    this.state = {
      loading: true,
      content: undefined,
    }
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    this.setState({ loading: true })
    DeltaBackend.call('messageList.getMessageInfo', this.props.messageId).then(
      info => {
        this.setState({ loading: false, content: info })
        this.forceUpdate()
      }
    )
  }

  render() {
    const { receivedAt, sentAt } = this.props
    const tx = window.translate

    return (
      <div className='module-message-detail'>
        <Callout>
          <p>{this.state.content}</p>
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
  message: MessageType
  onClose: DialogProps['onClose']
}) {
  const { message, onClose } = props
  const isOpen = !!message
  const tx = window.translate

  let body = <div />
  if (isOpen) {
    const { id, sentAt, receivedAt } = message.msg

    body = (
      <Card>
        <MessageInfo messageId={id} sentAt={sentAt} receivedAt={receivedAt} />
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
