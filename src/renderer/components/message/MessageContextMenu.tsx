import { onDownload } from './messageFunctions'
import React, { useRef, useState, useEffect } from 'react'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import { attachment } from '../attachment/Attachment'
import { MessageType } from '../../../shared/shared-types'
import { msgStatus } from './Message'

export type openContextMenuFunction = (
  event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>,
  params: MessageContextMenuProps
) => void

export type MessageContextMenuProps = {
  props: {
    attachment: attachment
    direction: 'incoming' | 'outgoing'
    status: msgStatus
    onDelete: Function
    message: MessageType | { msg: null }
    text?: string
    // onReply:Function
    onForward: Function
    // onRetrySend: Function
    onShowDetail: Function
  }
  textSelected: boolean
  link: string
}

export const MessageContextMenu = ({
  getShow,
}: {
  getShow: (
    cb: (event: MouseEvent, params: MessageContextMenuProps) => void
  ) => void
}) => {
  const [params, setParams] = useState<MessageContextMenuProps>(null)
  const [showEvent, setShowEvent] = useState(null)
  const contextMenu = useRef(null)
  const show = (event: MouseEvent, params: MessageContextMenuProps) => {
    // no log.debug, because passing the event object to through ipc freezes the application
    // console.debug('ChatListContextMenu.show', chat, event) // also commented out because it's not needed
    /*
     This is a workaround because react-contextmenu
     has no official programatic way of opening the menu yet
     https://github.com/vkbansal/react-contextmenu/issues/259
    */
    event.preventDefault()
    event.stopPropagation()
    const position = { x: event.clientX, y: event.clientY }
    const ev = { detail: { id: 'message-context-menu', position } }
    setParams(params)
    setShowEvent(ev)
  }
  useEffect(() => {
    getShow(show)
  }, [])
  useEffect(() => {
    if (showEvent) contextMenu.current.handleShow(showEvent)
  })

  return (
    <ContextMenu id={'message-context-menu'} ref={contextMenu}>
      {(params && renderMenuContent(params)) || 'Error'}
    </ContextMenu>
  )
}

function renderMenuContent(params: MessageContextMenuProps) {
  const tx = window.translate
  const { props, link, textSelected } = params
  const {
    attachment,
    direction,
    status,
    onDelete,
    message,
    text,
    // onReply,
    onForward,
    // onRetrySend,
    onShowDetail,
  } = props
  // let showRetry = status === 'error' && direction === 'outgoing'
  return (
    <>
      {link !== '' && (
        <MenuItem onClick={_ => navigator.clipboard.writeText(link)}>
          {tx('menu_copy_link_to_clipboard')}
        </MenuItem>
      )}
      {textSelected ? (
        <MenuItem
          onClick={_ => {
            navigator.clipboard.writeText(window.getSelection().toString())
          }}
        >
          {tx('menu_copy_selection_to_clipboard')}
        </MenuItem>
      ) : (
        <MenuItem
          onClick={_ => {
            navigator.clipboard.writeText(text)
          }}
        >
          {tx('menu_copy_to_clipboard')}
        </MenuItem>
      )}
      {attachment ? (
        <MenuItem onClick={onDownload.bind(null, message.msg)}>
          {tx('download_attachment_desktop')}
        </MenuItem>
      ) : null}

      <MenuItem onClick={onForward}>{tx('menu_forward')}</MenuItem>
      <MenuItem onClick={onShowDetail}>{tx('more_info_desktop')}</MenuItem>

      <MenuItem onClick={onDelete}>{tx('delete_message_desktop')}</MenuItem>
    </>
  )
}
