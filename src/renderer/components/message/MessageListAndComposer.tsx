import React, { useRef, useContext, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import Composer, { useDraft } from '../composer/Composer'
import { getLogger } from '../../../shared/logger'
import MessageList from './MessageList'
import { ScreenContext } from '../../contexts'
import ChatStore, { ChatStoreStateWithChatSet } from '../../stores/chat'
import ComposerMessageInput from '../composer/ComposerMessageInput'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { join, parse } from 'path'
import { runtime } from '../../runtime'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { useSettingsStore } from '../../stores/settings'
import { Type } from '../../backend-com'
import { C } from 'deltachat-node/node/dist/constants'

const log = getLogger('renderer/MessageListAndComposer')

export function getBackgroundImageStyle(
  settings: DesktopSettingsType
): React.CSSProperties {
  const style: React.CSSProperties = {
    backgroundSize: 'cover',
  }

  if (!settings) return style

  let bgImg = settings['chatViewBgImg']
  if (bgImg) {
    if (bgImg && bgImg.startsWith('url')) {
      // migrating in case of absolute filepaths
      const filePath = parse(bgImg.slice(5, bgImg.length - 2)).base
      bgImg = `img: ${filePath}`
      DeltaBackend.call('settings.setDesktopSetting', 'chatViewBgImg', bgImg)
    } else if (bgImg.startsWith('#')) {
      // migrating to new prefixes
      bgImg = `color: ${bgImg}`
      DeltaBackend.call('settings.setDesktopSetting', 'chatViewBgImg', bgImg)
    }
    if (bgImg.startsWith('img: ')) {
      const filePath = bgImg.slice(5)
      const bgImgPath = join(runtime.getConfigPath(), 'background/', filePath)
      style.backgroundImage = `url("file://${bgImgPath}")`
    } else if (bgImg.startsWith('color: ')) {
      style.backgroundColor = bgImg.slice(7)
      style.backgroundImage = 'none'
    } else if (bgImg === 'var(--chatViewBg)') {
      // theme default background color
      style.backgroundColor = bgImg
      style.backgroundImage = 'none'
    } else {
      log.error(
        `Could not read background image ${bgImg} from config file under ${runtime.getConfigPath()}.`
      )
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
      cb: async (yes: boolean) => {
        if (!yes) return

        for (const file of sanitizedFileList) {
          ChatStore.effect.sendMessage({
            chatId,
            message: { filename: file.path },
          })
        }
      },
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

  const settingsStore = useSettingsStore()[0]
  const style = settingsStore
    ? getBackgroundImageStyle(settingsStore.desktopSettings)
    : {}

  return (
    <div
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDrop={onDrop.bind({ props: { chat: chatStore } })}
      onDragOver={onDragOver}
    >
      <div className='message-list-and-composer__message-list'>
        <RecoverableCrashScreen reset_on_change_key={chatStore.chat.id}>
          <MessageList chatStore={chatStore} refComposer={refComposer} />
        </RecoverableCrashScreen>
      </div>
      <Composer
        ref={refComposer}
        selectedChat={chatStore.chat}
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

export function isChatReadonly(
  chat: Pick<
    Type.FullChat,
    'isContactRequest' | 'isDeviceChat' | 'chatType' | 'selfInGroup' | 'canSend'
  >
): [isDisabled: boolean, disabledReason: string] {
  if (chat.canSend) {
    return [false, '']
  } else {
    if (chat.isContactRequest) {
      return [true, 'messaging_disabled_deaddrop']
    } else if (chat.isDeviceChat === true) {
      return [true, 'messaging_disabled_device_chat']
    } else if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      return [true, 'messaging_disabled_mailing_list']
    } else if (chat.chatType === C.DC_CHAT_TYPE_GROUP && !chat.selfInGroup) {
      return [true, 'messaging_disabled_not_in_group']
    } else {
      return [true, 'UNKNOWN DISABLED REASON']
    }
  }
}
