import React, { useRef, useContext, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import Composer, { useDraft } from '../composer/Composer'
import { getLogger } from '../../../shared/logger'
import MessageList from './MessageList'
import { SettingsContext, ScreenContext } from '../../contexts'
import { ChatStoreStateWithChatSet } from '../../stores/chat'
import ComposerMessageInput from '../composer/ComposerMessageInput'
import { DesktopSettings } from '../../../shared/shared-types'
import { isChatReadonly } from '../../../shared/util'

const log = getLogger('renderer/MessageListAndComposer')

export function getBackgroundImageStyle(
  settings: DesktopSettings
): React.CSSProperties {
  const style: React.CSSProperties = {
    backgroundSize: 'cover',
  }

  if (!settings) return style

  const bgImg = settings['chatViewBgImg']
  if (bgImg) {
    if (bgImg && bgImg.indexOf('url') !== -1) {
      style.backgroundImage = `url("file://${bgImg.slice(
        5,
        bgImg.length - 2
      )}")`
    } else {
      style.backgroundColor = bgImg
      style.backgroundImage = 'none'
    }
  }
  return style
}

export default function MessageListAndComposer({
  chatStore,
}: {
  chatStore: ChatStoreStateWithChatSet
}) {
  const conversationRef = useRef(null)
  const refComposer = useRef(null)
  const { openDialog } = useContext(ScreenContext)

  const messageInputRef = useRef<ComposerMessageInput>(null)
  const {
    draftState,
    updateDraftText,
    removeQuote,
    addFileToDraft,
    removeFile,
    clearDraft,
  } = useDraft(
    chatStore.chat.id,
    chatStore.chat.isContactRequest,
    messageInputRef
  )

  const onDrop = (e: React.DragEvent<any>) => {
    if (chatStore.chat === null) {
      log.warn('droped something, but no chat is selected')
      return
    }
    const chatId = chatStore.chat.id as number

    e.preventDefault()
    e.stopPropagation()
    const sanitizedFileList: Pick<File, 'name' | 'path'>[] = []
    {
      const fileList: FileList = (e.target as any).files || e.dataTransfer.files
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
    const tx = window.static_translate
    const fileCount = sanitizedFileList.length
    if (fileCount === 0) {
      return
    }
    if (fileCount === 1) {
      addFileToDraft(sanitizedFileList[0].path)
      return
    }
    // This is a desktop specific "hack" to support sending multiple attachments at once.
    openDialog('ConfirmationDialog', {
      message: (
        <>
          {tx(
            'ask_send_following_n_files_to',
            fileCount > 1
              ? [String(fileCount), chatStore.chat.name]
              : [chatStore.chat.name],
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
          DeltaBackend.call('messageList.sendMessage', chatId, {
            filename: path,
          })
        ),
    })
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onMouseUp = (e: MouseEvent) => {
    const selection = window.getSelection()

    if (selection?.type === 'Range' && selection.rangeCount > 0) {
      return
    }
    const targetTagName = ((e.target as unknown) as any)?.tagName

    if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    messageInputRef?.current?.focus()
    return false
  }

  const onSelectionChange = () => {
    const selection = window.getSelection()

    if (
      selection?.type === 'Caret' ||
      (selection?.type === 'Range' && selection.rangeCount > 0)
    )
      return

    messageInputRef?.current?.focus()
  }

  const onEscapeKeyUp = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      messageInputRef?.current?.focus()
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('keyup', onEscapeKeyUp)
    messageInputRef?.current?.focus()
    return () => {
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('keyup', onEscapeKeyUp)
    }
  }, [])

  const [disabled, disabledReason] = isChatReadonly(chatStore.chat)

  const settings = useContext(SettingsContext).desktopSettings
  const style = settings ? getBackgroundImageStyle(settings) : {}

  return (
    <div
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDrop={onDrop.bind({ props: { chat: chatStore } })}
      onDragOver={onDragOver}
    >
      <div className='message-list-and-composer__message-list'>
        <MessageList chatStore={chatStore} refComposer={refComposer} />
      </div>
      <Composer
        ref={refComposer}
        chatId={chatStore.chat.id}
        isDisabled={disabled}
        disabledReason={disabledReason}
        isContactRequest={chatStore.chat.isContactRequest}
        messageInputRef={messageInputRef}
        draftState={draftState}
        updateDraftText={updateDraftText}
        removeQuote={removeQuote}
        addFileToDraft={addFileToDraft}
        removeFile={removeFile}
        clearDraft={clearDraft}
      />
    </div>
  )
}
