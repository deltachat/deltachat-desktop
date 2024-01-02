import { join, parse } from 'path'

import React, { useCallback, useEffect, useRef } from 'react'

import MessageList from './MessageList'
import { getLogger } from '../../../shared/logger'
import useDialog from '../../hooks/useDialog'
import { runtime } from '../../runtime'
import { useSettingsStore } from '../../stores/settings'
import Composer, { useDraft } from '../composer/Composer'
import useIsChatDisabled from '../composer/useIsChatDisabled'
import ConfirmSendingFiles from '../dialogs/ConfirmSendingFiles'
import { sendMessage } from '../helpers/ChatMethods'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'

import type { DesktopSettingsType } from '../../../shared/shared-types'
import type { ChatStoreStateWithChatSet } from '../../stores/chat'
import type ComposerMessageInput from '../composer/ComposerMessageInput'
import type { Viewtype } from '@deltachat/jsonrpc-client/dist/generated/types'

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
      runtime.setDesktopSetting('chatViewBgImg', bgImg)
    } else if (bgImg.startsWith('#')) {
      // migrating to new prefixes
      bgImg = `color: ${bgImg}`
      runtime.setDesktopSetting('chatViewBgImg', bgImg)
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
  const { openDialog, hasOpenDialogs } = useDialog()

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
    chatStore.chat.isProtectionBroken,
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
    const sanitizedFileList: Pick<File, 'name' | 'path' | 'type'>[] = []
    {
      const fileList: FileList = (e.target as any).files || e.dataTransfer.files
      // TODO maybe add a clause here for windows because that uses backslash instead of slash
      const forbiddenPathRegEx = /DeltaChat\/.+?\.sqlite-blobs\//gi
      for (let i = 0; i < fileList.length; i++) {
        const { path, name, type } = fileList[i]
        // TODO filter out folders somehow
        // if that is possible without a backend call to check whether the file exists,
        // maybe some browser api like FileReader could help
        if (!forbiddenPathRegEx.test(path.replace('\\', '/'))) {
          sanitizedFileList.push({ path, name, type })
        } else {
          log.warn(
            'Prevented a file from being send again while dragging it out',
            name
          )
        }
      }
    }

    const fileCount = sanitizedFileList.length

    if (fileCount === 0) {
      return
    }

    if (fileCount === 1) {
      log.debug(`dropped image of type ${sanitizedFileList[0].type}`)
      const msgViewType: Viewtype = sanitizedFileList[0].type.startsWith(
        'image'
      )
        ? 'Image'
        : 'File'
      addFileToDraft(sanitizedFileList[0].path, msgViewType)
      return
    }

    // This is a desktop specific "hack" to support sending multiple attachments at once.
    openDialog(ConfirmSendingFiles, {
      sanitizedFileList,
      chatName: chatStore.chat.name,
      onClick: (isConfirmed: boolean) => {
        if (!isConfirmed) {
          return
        }

        for (const file of sanitizedFileList) {
          sendMessage(chatId, { file: file.path, viewtype: 'File' })
        }
      },
    })
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      const selection = window.getSelection()

      if (selection?.type === 'Range' && selection.rangeCount > 0) {
        return
      }
      const targetTagName = (e.target as unknown as any)?.tagName

      if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') {
        return
      }

      // don't force focus on the message input as long as the emoji picker is open
      if (
        document.querySelector(':focus')?.tagName?.toLowerCase() ===
        'em-emoji-picker'
      ) {
        return
      }

      if (!hasOpenDialogs) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      messageInputRef?.current?.focus()
      return false
    },
    [hasOpenDialogs]
  )

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
  }, [onMouseUp])

  const [isDisabled, disabledReason] = useIsChatDisabled(chatStore.chat)

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
        isDisabled={isDisabled}
        disabledReason={disabledReason}
        isContactRequest={chatStore.chat.isContactRequest}
        isProtectionBroken={chatStore.chat.isProtectionBroken}
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
