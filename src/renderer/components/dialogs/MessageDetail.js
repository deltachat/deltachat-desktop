import React from 'react'
import { convertContactProps } from '../contact/Contact'
import DeltaDialog, { DeltaDialogBody } from './DeltaDialog'
import moment from 'moment'
import { callDcMethodAsync } from '../../ipc'
import { Card, Callout } from '@blueprintjs/core'

class MessageInfo extends React.Component {
  constructor () {
    super()
    this.state = {
      loading: true,
      content: undefined
    }
  }

  componentDidMount () {
    this.refresh()
  }

  refresh () {
    this.setState({ loading: true })
    callDcMethodAsync('messageList.getMessageInfo', this.props.message.id)
      .then(info => {
        this.setState({ loading: false, content: info })
        this.forceUpdate()
      })
  }

  render () {
    const { errors, message, receivedAt, sentAt } = this.props
    const tx = window.translate

    return (
      <div className='module-message-detail'>
        <Callout>
          <p>{this.state.content}</p>
        </Callout>
        <table className='module-message-detail__info'>
          <tbody>
            {(errors || []).map((error, index) => (
              <tr key={message.id}>
                <td className='module-message-detail__label'>
                  {tx('error')}
                </td>
                <td>
                  {' '}
                  <span className='error-message'>{error.message}</span>{' '}
                </td>
              </tr>
            ))}
            <tr>
              <td className='module-message-detail__label'>{tx('message_detail_sent_desktop')}</td>
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

export default function MessageDetail (props) {
  const { chat, message, onClose } = props
  const isOpen = !!message
  const tx = window.translate

  let body = <div />
  if (isOpen) {
    const msg = message.msg
    msg.disableMenu = true
    msg.onDelete = message.onDelete
    const contacts = message.isMe
      ? chat.contacts.map(convertContactProps)
      : [convertContactProps(message.contact)]

    body = <Card><MessageInfo
      contacts={contacts}
      status={msg.status}
      message={msg}
      sentAt={msg.sentAt}
      receivedAt={msg.receivedAt}
    /></Card>
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
