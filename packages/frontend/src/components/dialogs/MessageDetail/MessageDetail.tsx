import React, { useCallback, useContext, useEffect, useState } from 'react'

import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import Callout from '../../Callout'

import type { DialogProps } from '../../../contexts/DialogContext'
import { FormattedMessageInfo } from './ReadReceipts'
import type { T } from '@deltachat/jsonrpc-client'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'
import { mouseEventToPosition } from '../../../utils/mouseEventToPosition'

function MessageInfo({
  messageId,
  showTechnicalDetails,
  onCloseTechnicalDetails,
  onClose,
}: {
  messageId: number
  showTechnicalDetails: boolean
  onCloseTechnicalDetails: () => void
  onClose: () => void
}) {
  const [content, setContent] = useState<string | undefined>()
  const [message, setMessage] = useState<T.Message | undefined>()

  const tx = window.static_translate

  useEffect(() => {
    const accountId = selectedAccountId()
    async function refresh() {
      const message = await BackendRemote.rpc.getMessage(accountId, messageId)
      const info = await BackendRemote.rpc.getMessageInfo(accountId, messageId)
      setContent(info)
      setMessage(message)
    }
    refresh()
  }, [messageId])

  // Escape key handler for technical details dialog
  useEffect(() => {
    if (!showTechnicalDetails) return
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.code === 'Escape') {
        ev.preventDefault()
        ev.stopPropagation()
        onCloseTechnicalDetails()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTechnicalDetails, onCloseTechnicalDetails])

  return (
    <div className='module-message-detail'>
      <br />
      {message && content && (
        <FormattedMessageInfo
          message={message}
          info={content}
          messageId={messageId}
          onClose={onClose}
        />
      )}
      {showTechnicalDetails && (
        <Dialog canEscapeKeyClose={false} onClose={onCloseTechnicalDetails}>
          <DialogHeader title={tx('info')} onClose={onCloseTechnicalDetails} />
          <DialogBody>
            <Callout>
              <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
            </Callout>
          </DialogBody>
        </Dialog>
      )}
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
  const { openContextMenu } = useContext(ContextMenuContext)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  const onContextMenuClick = useCallback(
    (
      event: React.MouseEvent<
        HTMLDivElement | HTMLAnchorElement | HTMLLIElement,
        MouseEvent
      >
    ) => {
      openContextMenu({
        ...mouseEventToPosition(event),
        items: [
          {
            label: tx('global_menu_view_developer_desktop'),
            action: () => setShowTechnicalDetails(true),
          },
        ],
      })
    },
    [openContextMenu, tx]
  )

  const onCloseTechnicalDetails = useCallback(
    () => setShowTechnicalDetails(false),
    []
  )

  let body = <div />
  if (isOpen) {
    body = (
      <MessageInfo
        messageId={id}
        showTechnicalDetails={showTechnicalDetails}
        onCloseTechnicalDetails={onCloseTechnicalDetails}
        onClose={onClose}
      />
    )
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={tx('menu_message_details')}
        onClose={onClose}
        onContextMenuClick={isOpen ? onContextMenuClick : undefined}
      />
      <DialogBody>{body}</DialogBody>
    </Dialog>
  )
}
