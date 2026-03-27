import React, { useCallback, useContext, useEffect, useState } from 'react'

import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import Callout from '../../Callout'
import useDialog from '../../../hooks/dialog/useDialog'

import type { DialogProps } from '../../../contexts/DialogContext'
import { BasicMessageInfo } from './BasicMessageInfo'
import type { T } from '@deltachat/jsonrpc-client'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'
import { mouseEventToPosition } from '../../../utils/mouseEventToPosition'
import styles from './styles.module.scss'

function TechnicalMessageInfoDialog({
  messageId,
  onClose,
}: {
  messageId: number
} & DialogProps) {
  const [content, setContent] = useState<string | undefined>()
  const tx = window.static_translate

  useEffect(() => {
    const accountId = selectedAccountId()
    BackendRemote.rpc.getMessageInfo(accountId, messageId).then(setContent)
  }, [messageId])

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={tx('info')} onClose={onClose} />
      <DialogBody>
        <Callout>
          <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
        </Callout>
      </DialogBody>
    </Dialog>
  )
}

function MessageInfo({
  messageId,
  onClose,
}: {
  messageId: number
  onClose: () => void
}) {
  const [content, setContent] = useState<string | undefined>()
  const [message, setMessage] = useState<T.Message | undefined>()

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

  return (
    <>
      {message && content && (
        <BasicMessageInfo
          message={message}
          info={content}
          messageId={messageId}
          onClose={onClose}
        />
      )}
    </>
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
  const { openDialog } = useDialog()

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
            action: () =>
              openDialog(TechnicalMessageInfoDialog, { messageId: id }),
          },
        ],
      })
    },
    [openContextMenu, tx, openDialog, id]
  )

  let body = <div />
  if (isOpen) {
    body = <MessageInfo messageId={id} onClose={onClose} />
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        className={styles.dialogHeader}
        title={tx('menu_message_details')}
        onClose={onClose}
        onContextMenuClick={isOpen ? onContextMenuClick : undefined}
      />
      <DialogBody>{body}</DialogBody>
    </Dialog>
  )
}
