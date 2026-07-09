import React, { useRef, useEffect, useEffectEvent } from 'react'
import { join, parse, ParsedPath } from 'path'
import { T } from '@deltachat/jsonrpc-client'

import Composer from '../composer/Composer'
import { useDraft } from '../../hooks/chat/useDraft'
import { getLogger } from '@deltachat-desktop/shared/logger'
import MessageList from './MessageList'
import type ComposerMessageInput from '../composer/ComposerMessageInput'
import { DesktopSettingsType } from '@deltachat-desktop/shared/shared-types'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { useSettingsStore } from '../../stores/settings'
import ConfirmSendingFiles from '../dialogs/ConfirmSendingFiles'
import { ReactionsBarProvider } from '../ReactionsBar'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'
import type { useMessageList } from '../../stores/messagelist'
import { IMAGE_EXTENSIONS } from '@deltachat-desktop/shared/constants'

const log = getLogger('renderer/MessageListAndComposer')

type Props = {
  chat: T.FullChat
  accountId: number
  messageListData: ReturnType<typeof useMessageList>
}

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
      const target = runtime.getRuntimeInfo().target
      switch (target) {
        case 'electron': {
          style.backgroundImage = `url("file://${join(
            runtime.getConfigPath(),
            'background/',
            filePath
          )}")`
          break
        }
        case 'tauri': {
          const base =
            runtime.getRuntimeInfo()?.tauriSpecific?.scheme.chatBackgroundImage
          style.backgroundImage = `url("${base}${filePath}")`
          break
        }
        case 'browser': {
          style.backgroundImage = `url("/${join('background/', filePath)}")`
          break
        }
        default: {
          const _: never = target
        }
      }
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

function isImage(file: ParsedPath) {
  return IMAGE_EXTENSIONS.map(ext => '.' + ext).includes(file.ext.toLowerCase())
}

export default function MessageListAndComposer({
  accountId,
  chat,
  messageListData,
}: Props) {
  const conversationRef = useRef<HTMLDivElement>(null)
  const refComposer = useRef(null)

  const { openDialog, hasOpenDialogs } = useDialog()
  const { sendMessage } = useMessage()

  const regularMessageInputRef = useRef<ComposerMessageInput>(null)
  const editMessageInputRef = useRef<ComposerMessageInput>(null)

  const {
    store: messageListStore,
    state: messageListState,
    fetchMoreBottom,
    fetchMoreTop,
  } = messageListData

  const {
    draftState,
    draftIsLoading,
    updateDraftText,
    onSelectReplyToShortcut,
    removeQuote,
    addFileToDraft,
    removeFile,
    clearDraftState,
    setDraftState,
  } = useDraft(
    messageListState,
    accountId,
    chat.id,
    chat.canSend,
    regularMessageInputRef
  )

  const handleDrop = useEffectEvent(async (paths: string[]) => {
    log.info('drag: handling drop: ', paths)
    if (chat === null) {
      log.warn('dropped something, but no chat is selected')
      return
    }
    const sanitized = paths
      .filter(path => {
        const val = runtime.isDroppedFileFromOutside(path)
        if (!val) {
          log.warn(
            'Prevented a file from being sent again while dragging it out',
            path
          )
        }
        return val
      })
      // TODO `parse` is a polyfill, and doesn't properly work
      // for Windows paths.
      // Namely, `name` is the full path, except for file extension
      // (unless the file has no extension, then the things are even worse).
      .map(path => ({ parsed: parse(path), pathStr: path }))

    // send single file
    if (sanitized.length == 1) {
      const file = sanitized[0]
      const msgViewType: T.Viewtype = isImage(file.parsed) ? 'Image' : 'File'
      await addFileToDraft(
        file.pathStr,
        file.parsed.name + file.parsed.ext,
        msgViewType
      )
    }
    // send multiple files
    else if (sanitized.length > 1 && !hasOpenDialogs) {
      openDialog(ConfirmSendingFiles, {
        sanitizedFileList: sanitized.map(path => ({
          name: path.parsed.name,
        })),
        chatName: chat.name,
        onClick: async (isConfirmed: boolean) => {
          if (!isConfirmed) {
            return
          }

          for (const file of sanitized) {
            const msgViewType: T.Viewtype = isImage(file.parsed)
              ? 'Image'
              : 'File'
            sendMessage(accountId, chat.id, {
              file: file.pathStr,
              filename: file.parsed.name + file.parsed.ext,
              viewtype: msgViewType,
            })
          }
        },
      })
    }
  })

  useEffect(() => {
    log.debug('drag: register')
    runtime.setDropListener({
      elementRef: conversationRef,
      handler: handleDrop,
    })
    return () => {
      log.debug('drag: unregister')
      runtime.setDropListener(null)
    }
  }, [])

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  useEffect(() => {
    // Only one of these is actually rendered at any given moment.
    regularMessageInputRef.current?.focus()
    editMessageInputRef.current?.focus()
  }, [])

  const settingsStore = useSettingsStore()[0]
  // If you want to update this, don't forget to update
  // the `.background-preview` element as well.
  const style = settingsStore
    ? getBackgroundImageStyle(settingsStore.desktopSettings)
    : {}

  return (
    <div
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDragOver={onDragOver}
    >
      <div className='message-list-and-composer__message-list'>
        <MessageListMemoized
          accountId={accountId}
          chat={chat}
          refComposer={refComposer}
          messageListStore={messageListStore}
          messageListState={messageListState}
          fetchMoreBottom={fetchMoreBottom}
          fetchMoreTop={fetchMoreTop}
        />
      </div>
      <Composer
        ref={refComposer}
        selectedChat={chat}
        isContactRequest={chat.isContactRequest}
        regularMessageInputRef={regularMessageInputRef}
        editMessageInputRef={editMessageInputRef}
        draftState={draftState}
        draftIsLoading={draftIsLoading}
        updateDraftText={updateDraftText}
        onSelectReplyToShortcut={onSelectReplyToShortcut}
        removeQuote={removeQuote}
        addFileToDraft={addFileToDraft}
        removeFile={removeFile}
        clearDraftState={clearDraftState}
        setDraftState={setDraftState}
        messageCache={messageListState.messageCache}
      />
    </div>
  )
}

const MessageListMemoized = React.memo(
  (args: Parameters<typeof MessageList>[0]) => (
    <RecoverableCrashScreen reset_on_change_key={args.chat.id}>
      <ReactionsBarProvider>
        <MessageList {...args} />
      </ReactionsBarProvider>
    </RecoverableCrashScreen>
  )
)
