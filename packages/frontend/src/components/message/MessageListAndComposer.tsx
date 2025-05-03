import React, { useRef, useEffect, useCallback } from 'react'
import { basename, join, parse, ParsedPath } from 'path'
import { T } from '@deltachat/jsonrpc-client'

import Composer, { useDraft } from '../composer/Composer'
import { getLogger } from '../../../../shared/logger'
import MessageList from './MessageList'
import type ComposerMessageInput from '../composer/ComposerMessageInput'
import { DesktopSettingsType } from '../../../../shared/shared-types'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { useSettingsStore } from '../../stores/settings'
import ConfirmSendingFiles from '../dialogs/ConfirmSendingFiles'
import { ReactionsBarProvider } from '../ReactionsBar'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'
import { BackendRemote } from '../../backend-com'
import { Viewtype } from '@deltachat/jsonrpc-client/dist/generated/types'

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

type Props = {
  chat: T.FullChat
  accountId: number
}

function fullPath(file: ParsedPath) {
  return file.dir + '/' + file.name + file.ext
}
function isImage(file: ParsedPath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  return imageExtensions.includes(file.ext)
}

export default function MessageListAndComposer({ accountId, chat }: Props) {
  const conversationRef = useRef(null)
  const refComposer = useRef(null)

  const { openDialog, hasOpenDialogs } = useDialog()
  const { sendMessage } = useMessage()

  const regularMessageInputRef = useRef<ComposerMessageInput>(null)
  const editMessageInputRef = useRef<ComposerMessageInput>(null)
  const {
    draftState,
    updateDraftText,
    onSelectReplyToShortcut,
    removeQuote,
    addFileToDraft,
    removeFile,
    clearDraftStateButKeepTextareaValue,
  } = useDraft(
    accountId,
    chat.id,
    chat.isContactRequest,
    chat.isProtectionBroken,
    chat.canSend,
    regularMessageInputRef
  )

  // Tauri listener
  useEffect(() => {
    const unset = runtime.setDragListener(async e => {
      if (e.payload.type != 'drop') {
        return
      }

      // sanitize files
      const paths = e.payload.paths
      handleDrop(paths)
    })
    return () => {
      unset.then(u => {
        log.info('dragListenerUnset')
        u()
      })
    }
  })

  // Electron and webview listener
  const onDrop = async (e: React.DragEvent<any>) => {
    e.preventDefault()
    function writeTempFileFromFile(file: File): Promise<string> {
      if (file.size > 1e8 /* 100mb */) {
        log.warn(
          `dropped file is bigger than 100mb ${file.name} ${file.size} ${file.type}`
        )
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = _ => {
          if (reader.result === null) {
            return reject(new Error('result empty'))
          } else if (typeof reader.result !== 'string') {
            return reject(new Error('wrong type'))
          }
          const base64Content = reader.result.split(',')[1]
          runtime
            .writeTempFileFromBase64(file.name, base64Content)
            .then(tempUrl => {
              resolve(tempUrl)
            })
            .catch(err => {
              reject(err)
            })
        }
        reader.onerror = err => {
          reject(err)
        }
        reader.readAsDataURL(file)
      })
    }
    e.stopPropagation()

    const paths = []
    for (const path of e.dataTransfer.files) {
      paths.push(await writeTempFileFromFile(path))
    }
    handleDrop(paths)
  }
  const handleDrop = async (paths: string[]) => {
    if (chat === null) {
      log.warn('dropped something, but no chat is selected')
      return
    }
    const forbiddenPathRegEx = /DeltaChat\/.+?\.sqlite-blobs\//gi
    const sanitized = paths
      .filter(path => {
        const val = !forbiddenPathRegEx.test(path.replace('\\', '/'))
        if (!val) {
          log.warn(
            'Prevented a file from being sent again while dragging it out',
            path
          )
        }
        return val
      })
      .map(path => parse(path))

    // send single file
    if (sanitized.length == 1) {
      const file = sanitized[0]
      const msgViewType: Viewtype = isImage(file) ? 'Image' : 'File'
      await addFileToDraft(fullPath(file), file.name + file.ext, msgViewType)
    }
    // send multiple files
    else if (sanitized.length > 1) {
      openDialog(ConfirmSendingFiles, {
        sanitizedFileList: sanitized.map(path => ({
          name: path.name,
        })),
        chatName: chat.name,
        onClick: async (isConfirmed: boolean) => {
          if (!isConfirmed) {
            return
          }

          for (const file of sanitized) {
            const msgViewType: Viewtype = isImage(file) ? 'Image' : 'File'
            sendMessage(accountId, chat.id, {
              file: fullPath(file),
              filename: file.name + file.ext,
              viewtype: msgViewType,
            })
          }
        },
      })
    }
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

      // Only one of these is actually rendered at any given moment.
      regularMessageInputRef.current?.focus()
      editMessageInputRef.current?.focus()

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

    // Only one of these is actually rendered at any given moment.
    regularMessageInputRef.current?.focus()
    editMessageInputRef.current?.focus()
  }

  const onEscapeKeyUp = (ev: KeyboardEvent) => {
    if (ev.code === 'Escape') {
      // Only one of these is actually rendered at any given moment.
      regularMessageInputRef.current?.focus()
      editMessageInputRef.current?.focus()
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('keyup', onEscapeKeyUp)

    // Only one of these is actually rendered at any given moment.
    regularMessageInputRef.current?.focus()
    editMessageInputRef.current?.focus()

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('keyup', onEscapeKeyUp)
    }
  }, [onMouseUp])

  const settingsStore = useSettingsStore()[0]
  // If you want to update this, don't forget to update
  // the `.background-preview` element as well.
  const style = settingsStore
    ? getBackgroundImageStyle(settingsStore.desktopSettings)
    : {}

  const isElectron = typeof navigator === 'object' && navigator.userAgent.includes('Electron');
  return (
    <div
      role='tabpanel'
      aria-labelledby='tab-message-list-view'
      // NoChatSelected also has this ID and class.
      id='message-list-and-composer'
      className='message-list-and-composer'
      style={style}
      ref={conversationRef}
      onDrop={isElectron ? onDrop.bind({ props: { chat } }) : undefined}
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
        regularMessageInputRef={regularMessageInputRef}
        editMessageInputRef={editMessageInputRef}
        draftState={draftState}
        updateDraftText={updateDraftText}
        onSelectReplyToShortcut={onSelectReplyToShortcut}
        removeQuote={removeQuote}
        addFileToDraft={addFileToDraft}
        removeFile={removeFile}
        clearDraftStateButKeepTextareaValue={
          clearDraftStateButKeepTextareaValue
        }
      />
    </div>
  )
}
