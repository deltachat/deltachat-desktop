import React, { useRef, useState, useContext, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import Composer from '../composer/Composer'
import { getLogger } from '../../../shared/logger'
import MessageList from './MessageList'
import { SettingsContext, ScreenContext } from '../../contexts'
import { C } from 'deltachat-node/dist/constants'
import { useDebouncedCallback } from 'use-debounce'
import { ChatStoreState } from '../../stores/chat'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import {
  openContextMenuFunction,
  MessageContextMenu,
} from './MessageContextMenu'

const { DC_CHAT_ID_DEADDROP, DC_CHAT_ID_STARRED } = C

const log = getLogger('renderer/messageListAndComposer')

export default function MessageListAndComposer({
  chat,
}: {
  chat: ChatStoreState
}) {
  const [state, setState] = useState({
    //error: false,
    composerSize: 40,
  })
  const conversationRef = useRef(null)
  const refComposer = useRef(null)
  const { openDialog } = useContext(ScreenContext)

  const [setComposerSize] = useDebouncedCallback(
    (size: number) => setState({ composerSize: size }),
    25
  )

  const onDrop = (e: React.DragEvent<any>) => {
    e.preventDefault()
    e.stopPropagation()
    let sanitizedFileList: Pick<File, 'name' | 'path'>[] = []
    {
      let fileList: FileList = (e.target as any).files || e.dataTransfer.files
      // TODO maybe add a clause here for windows because that uses backslash instead of slash
      const forbiddenPathRegEx = /DeltaChat\/.+?\.sqlite-blobs\//gi
      for (let i = 0; i < fileList.length; i++) {
        const { path, name } = fileList[i]
        // TODO filter out folders somehow
        // if that is possible without a backend call to check wheter the file exists,
        // maybe some browser api like FileReader could help
        if (!forbiddenPathRegEx.test(path.replace('\\', '/'))) {
          sanitizedFileList.push({ path, name })
        } else {
          log.warn(
            'Prevented a file from being send again while dragging it out',
            name
          )
        }
      }
    }
    const tx = window.translate
    const fileCount = sanitizedFileList.length
    openDialog('ConfirmationDialog', {
      message: (
        <>
          {tx(
            'ask_send_file_desktop',
            fileCount > 1 ? [String(fileCount), chat.name] : [chat.name],
            {
              quantity: fileCount,
            }
          )}
          <ul className='drop-file-dialog-file-list'>
            {sanitizedFileList.map(({ name }) => (
              <li key={name}>{' - ' + name}</li>
            ))}
          </ul>
        </>
      ),
      confirmLabel: tx('menu_send'),
      cb: (yes: boolean) =>
        yes &&
        sanitizedFileList.forEach(({ path }) =>
          DeltaBackend.call('messageList.sendMessage', chat.id, null, path)
        ),
    })
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const [disabled, disabledReason] = (({
    id,
    isGroup,
    selfInGroup,
  }): [boolean, string] => {
    if (id === DC_CHAT_ID_DEADDROP) {
      return [true, 'messaging_disabled_deaddrop']
    } else if (chat.isDeviceChat === true) {
      return [true, 'messaging_disabled_device_chat']
    } else if (id === DC_CHAT_ID_STARRED) {
      return [true, '']
    } else if (isGroup && !selfInGroup) {
      return [true, 'messaging_disabled_not_in_group']
    } else {
      return [false, '']
    }
  })(chat)

  const settings = useContext(SettingsContext)
  const style: React.CSSProperties = {
    backgroundSize: 'cover',
    gridTemplateRows: `auto ${state.composerSize}px`,
  }
  if (settings['chatViewBgImg']) {
    if (
      settings['chatViewBgImg'] &&
      settings['chatViewBgImg'].indexOf('url') !== -1
    ) {
      style.backgroundImage = settings['chatViewBgImg']
    } else {
      style.backgroundColor = settings['chatViewBgImg']
      style.backgroundImage = 'none'
    }
  }

  // Focus composer when switching chats
  useEffect(() => ActionEmitter.emitAction(KeybindAction.Composer_Focus), [
    chat.id,
  ])

  const realOpenContextMenu = useRef(null)

  const openContextMenu: openContextMenuFunction = (event, params) => {
    if (realOpenContextMenu.current === null)
      throw new Error(
        'Tried to open ChatListContextMenu before we recieved open method'
      )
    realOpenContextMenu.current(event, params)
  }

  return (
    <div
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDrop={onDrop.bind({ props: { chat } })}
      onDragOver={onDragOver}
    >
      <div className='message-list-and-composer__message-list'>
        <div
          onClick={ev => {
            ev.stopPropagation()
          }}
        >
          <MessageContextMenu
            getShow={show => {
              realOpenContextMenu.current = show
            }}
          />
        </div>
        <MessageList
          chat={chat}
          locationStreamingEnabled={settings.enableOnDemandLocationStreaming}
          openContextMenu={openContextMenu}
        />
      </div>
      <Composer
        ref={refComposer}
        chatId={chat.id}
        draft={chat.draft}
        setComposerSize={setComposerSize.bind(this)}
        isDisabled={disabled}
        disabledReason={disabledReason}
      />
    </div>
  )
}
