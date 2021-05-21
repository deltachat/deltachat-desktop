import React, { useRef, useContext, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import Composer, { useDraft } from '../composer/Composer'
import { getLogger } from '../../../shared/logger'
import MessageList from './MessageList'
import { SettingsContext, ScreenContext } from '../../contexts'
import { C } from 'deltachat-node/dist/constants'
import { ChatStoreState } from '../../stores/chat'
import ComposerMessageInput from '../composer/ComposerMessageInput'

const { DC_CHAT_ID_DEADDROP } = C

const log = getLogger('renderer/MessageListAndComposer')

export default function MessageListAndComposer({
  chat,
}: {
  chat: ChatStoreState
}) {
  const conversationRef = useRef(null)
  const refComposer = useRef(null)
  const { openDialog } = useContext(ScreenContext)

  const messageInputRef: React.MutableRefObject<ComposerMessageInput> = useRef<ComposerMessageInput>()
  const {
    draftState,
    updateDraftText,
    removeQuote,
    addFileToDraft,
    removeFile,
    clearDraft,
  } = useDraft(chat.id, messageInputRef)

  const onDrop = (e: React.DragEvent<any>) => {
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
          DeltaBackend.call('messageList.sendMessage', chat.id, {
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

    if (selection.type === 'Range' && selection.rangeCount > 0) return
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
      selection.type === 'Caret' ||
      (selection.type === 'Range' && selection.rangeCount > 0)
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

  const [disabled, disabledReason] = (({
    id,
    isGroup,
    selfInGroup,
  }): [boolean, string] => {
    if (id === DC_CHAT_ID_DEADDROP) {
      return [true, 'messaging_disabled_deaddrop']
    } else if (chat.isDeviceChat === true) {
      return [true, 'messaging_disabled_device_chat']
    } else if (chat.type === C.DC_CHAT_TYPE_MAILINGLIST) {
      return [true, 'messaging_disabled_mailing_list']
    } else if (isGroup && !selfInGroup) {
      return [true, 'messaging_disabled_not_in_group']
    } else {
      return [false, '']
    }
  })(chat)

  const settings = useContext(SettingsContext).desktopSettings
  const style: React.CSSProperties = {
    backgroundSize: 'cover',
  }
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

  return (
    <div
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDrop={onDrop.bind({ props: { chat } })}
      onDragOver={onDragOver}
    >
      <div className='message-list-and-composer__message-list'>
        <MessageList chat={chat} refComposer={refComposer} />
      </div>
      <Composer
        ref={refComposer}
        chatId={chat.id}
        isDisabled={disabled}
        disabledReason={disabledReason}
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
