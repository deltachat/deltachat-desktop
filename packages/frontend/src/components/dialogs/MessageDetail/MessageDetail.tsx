import React from 'react'
import moment from 'moment'

import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogWithHeader,
  DialogHeader,
} from '../../Dialog'
import Callout from '../../Callout'

import type { DialogProps } from '../../../contexts/DialogContext'
import { ReadReceiptsList, FormattedMessageInfo } from './ReadReceipts'
import type { T } from '@deltachat/jsonrpc-client'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'
import { mouseEventToPosition } from '../../../utils/mouseEventToPosition'

type MessageInfoProps = {
  messageId: number
}

class MessageInfo extends React.Component<
  MessageInfoProps,
  {
    loading: boolean
    content?: string
    message?: T.Message
    receivedAt?: number
    sentAt?: number
    isEdited?: boolean
    showTechnicalDetails: boolean
  }
> {
  static contextType = ContextMenuContext
  declare context: React.ContextType<typeof ContextMenuContext>

  constructor(props: MessageInfoProps) {
    super(props)
    this.state = {
      loading: true,
      content: undefined,
      message: undefined,
      receivedAt: undefined,
      sentAt: undefined,
      isEdited: false,
      showTechnicalDetails: false,
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
      message,
      sentAt: (message?.timestamp || 0) * 1000,
      receivedAt: (message?.receivedTimestamp || 0) * 1000,
      isEdited: message?.isEdited,
    })
    this.forceUpdate()
  }

  render() {
    const { message, content, showTechnicalDetails } = this.state

    return (
      <div className='module-message-detail'>
        <br />
        {message && content && (
          <FormattedMessageInfo
            message={message}
            info={content}
            messageId={this.props.messageId}
          />
        )}
        {showTechnicalDetails && (
          <DialogWithHeader
            title='Technical Details'
            onClose={() => this.setState({ showTechnicalDetails: false })}
          >
            <DialogBody>
              <Callout>
                <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
              </Callout>
            </DialogBody>
          </DialogWithHeader>
        )}
      </div>
    )
  }

  showContextMenu = (
    event: React.MouseEvent<
      HTMLDivElement | HTMLAnchorElement | HTMLLIElement,
      MouseEvent
    >
  ) => {
    const tx = window.static_translate
    const items = [
      {
        label: tx('developer'),
        action: () => this.setState({ showTechnicalDetails: true }),
      },
    ]

    this.context.openContextMenu({
      ...mouseEventToPosition(event),
      items,
    })
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

  const messageInfoRef = React.useRef<MessageInfo>(null)

  let body = <div />
  if (isOpen) {
    body = <MessageInfo ref={messageInfoRef} messageId={id} />
  }

  const showContextMenu = (
    event: React.MouseEvent<
      HTMLDivElement | HTMLAnchorElement | HTMLLIElement,
      MouseEvent
    >
  ) => {
    messageInfoRef.current?.showContextMenu(event)
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={tx('menu_message_details')}
        onClose={onClose}
        onContextMenuClick={isOpen ? showContextMenu : undefined}
      />
      <DialogBody>{body}</DialogBody>
    </Dialog>
  )
}
