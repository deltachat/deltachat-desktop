import React, { useRef, useEffect, useCallback } from 'react'
import { join, parse } from 'path'
import { Viewtype } from '@deltachat/jsonrpc-client/dist/generated/types'

import Composer, { useDraft } from '../composer/Composer'
import { getLogger } from '../../../shared/logger'
import MessageList from './MessageList'
import ComposerMessageInput from '../composer/ComposerMessageInput'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { runtime } from '../../runtime'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { useSettingsStore } from '../../stores/settings'
import ConfirmSendingFiles from '../dialogs/ConfirmSendingFiles'
import { ReactionsBarProvider } from '../ReactionsBar'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'

import type { T } from '@deltachat/jsonrpc-client'
import { BackendRemote } from '../../backend-com'
import { setQuoteInDraft } from './messageFunctions'

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

type Props = {
  chat: T.FullChat
  accountId: number
}

export default function MessageListAndComposer({ accountId, chat }: Props) {
  const conversationRef = useRef(null)
  const refComposer = useRef(null)

  const { openDialog, hasOpenDialogs } = useDialog()
  const { sendMessage } = useMessage()

  const messageInputRef = useRef<ComposerMessageInput>(null)
  const {
    draftState,
    updateDraftText,
    removeQuote,
    addFileToDraft,
    removeFile,
    clearDraft,
  } = useDraft(
    chat.id,
    chat.isContactRequest,
    chat.isProtectionBroken,
    messageInputRef
  )
  const settingsStore = useSettingsStore()[0]

  const onDrop = (e: React.DragEvent<any>) => {
    if (chat === null) {
      log.warn('dropped something, but no chat is selected')
      return
    }

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
      chatName: chat.name,
      onClick: (isConfirmed: boolean) => {
        if (!isConfirmed) {
          return
        }

        for (const file of sanitizedFileList) {
          sendMessage(accountId, chat.id, { file: file.path, viewtype: 'File' })
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

  const { jumpToMessage } = useMessage()
  const onCtrlArrow = useCallback(
    async (e: KeyboardEvent) => {
      if (
        (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') ||
        (!e.ctrlKey && !e.metaKey) ||
        (e.ctrlKey && e.metaKey) // Both at the same time
      ) {
        return
      }
      const quoteMessage = (messageId: number) => {
        setQuoteInDraft(messageId)

        // TODO improvement: perhaps the animation could used
        // a little less intensity.
        // Not good when jumping through several messages.
        // Can we just cancel the animation on the previously highlighted message?
        // Also it looks like it takes a while to execute
        jumpToMessage(accountId, messageId, true)
      }
      // TODO perf: I imagine this is pretty slow, given IPC and some chats
      // being quite large. Perhaps we could hook into the
      // MessageList component, or share the list of messages with it.
      // If not, at least cache this list. Use the cached version first,
      // then, when the Promise resolves, execute this code again in case
      // the message list got updated so that it feels more reponsive.
      const messageIds = await BackendRemote.rpc.getMessageIds(
        accountId,
        chat.id,
        false,
        false
      )
      const currQuote = window.__getQuoteInDraft?.()
      if (!currQuote) {
        quoteMessage(messageIds[messageIds.length - 1])
        return
      }
      if (currQuote.kind !== 'WithMessage') {
        // Or shall we override with the last message?
        return
      }
      const currQuoteMessageIdInd = messageIds.lastIndexOf(currQuote.messageId)
      const newId: number | undefined =
        messageIds[
          e.key === 'ArrowUp'
            ? currQuoteMessageIdInd - 1
            : currQuoteMessageIdInd + 1
        ]
      if (newId == undefined) {
        return
      }
      quoteMessage(newId)
    },
    [accountId, chat.id, jumpToMessage]
  )
  useEffect(() => {
    if (settingsStore?.desktopSettings.enableCtrlUpToReplyShortcut !== true) {
      return
    }
    window.addEventListener('keyup', onCtrlArrow)
    return () => window.removeEventListener('keyup', onCtrlArrow)
  }, [onCtrlArrow, settingsStore?.desktopSettings.enableCtrlUpToReplyShortcut])

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

  const style = settingsStore
    ? getBackgroundImageStyle(settingsStore.desktopSettings)
    : {}

  return (
    <div
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDrop={onDrop.bind({ props: { chat } })}
      onDragOver={onDragOver}
    >
      <div className='message-list-and-composer__message-list'>
        <RecoverableCrashScreen reset_on_change_key={chat.id}>
          <ReactionsBarProvider>
            <MessageList
              accountId={accountId}
              chat={chat}
              refComposer={refComposer}
            />
          </ReactionsBarProvider>
        </RecoverableCrashScreen>
      </div>
      <Composer
        ref={refComposer}
        selectedChat={chat}
        isContactRequest={chat.isContactRequest}
        isProtectionBroken={chat.isProtectionBroken}
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
