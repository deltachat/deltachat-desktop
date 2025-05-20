import React, { useRef, useEffect, useCallback } from 'react'
import { basename, join, parse } from 'path'
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

  const onDrop = async (e: React.DragEvent<any>) => {
    if (chat === null) {
      log.warn('dropped something, but no chat is selected')
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const sanitizedFileList: File[] = []
    {
      const fileList: FileList =
        /* (e.target as any).files */ e.dataTransfer.files
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        if (runtime.isDroppedFileFromOutside(file)) {
          sanitizedFileList.push(file)
        } else {
          log.warn(
            'Prevented a file from being send again while dragging it out',
            file.name
          )
        }
      }
    }

    const fileCount = sanitizedFileList.length

    if (fileCount === 0) {
      return
    }

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

    if (fileCount === 1) {
      const file = sanitizedFileList[0]
      log.debug(`dropped image of type ${file.type}`)
      const msgViewType: T.Viewtype = file.type.startsWith('image')
        ? 'Image'
        : 'File'

      const path = await writeTempFileFromFile(sanitizedFileList[0])
      await addFileToDraft(path, basename(path), msgViewType)
      await runtime.removeTempFile(path)
      return
    }

    // This is a desktop specific "hack" to support sending multiple attachments at once.
    openDialog(ConfirmSendingFiles, {
      sanitizedFileList,
      chatName: chat.name,
      onClick: async (isConfirmed: boolean) => {
        if (!isConfirmed) {
          return
        }

        for (const file of sanitizedFileList) {
          const path = await writeTempFileFromFile(file)
          const msgViewType: T.Viewtype = file.type.startsWith('image')
            ? 'Image'
            : 'File'
          await sendMessage(accountId, chat.id, {
            file: path,
            filename: basename(path),
            viewtype: msgViewType,
          })
          // start sending other files, don't wait until last file is sent
          runtime.removeTempFile(path)
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

      // Only one of these is actually rendered at any given moment.
      regularMessageInputRef.current?.focus()
      editMessageInputRef.current?.focus()

      return false
    },
    [hasOpenDialogs]
  )

  const onEscapeKeyUp = (ev: KeyboardEvent) => {
    if (ev.code === 'Escape') {
      // Only one of these is actually rendered at any given moment.
      regularMessageInputRef.current?.focus()
      editMessageInputRef.current?.focus()
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('keyup', onEscapeKeyUp)

    // Only one of these is actually rendered at any given moment.
    regularMessageInputRef.current?.focus()
    editMessageInputRef.current?.focus()

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('keyup', onEscapeKeyUp)
    }
  }, [onMouseUp])

  const settingsStore = useSettingsStore()[0]
  // If you want to update this, don't forget to update
  // the `.background-preview` element as well.
  const style = settingsStore
    ? getBackgroundImageStyle(settingsStore.desktopSettings)
    : {}

  return (
    <div
      role='tabpanel'
      // Techically we must apply `aria-labelledby` to `tabpanel`,
      // but it's a little annoying that screen readers (NVDA)
      // announce "'Chat' property page" every time
      // the focus enters this tabpanel, because it's the "default" one,
      // it's not often that another tab (Gallery) is selected.
      // So, let's comment this out for now, until we resolve
      // https://github.com/deltachat/deltachat-desktop/issues/5074.
      // aria-labelledby='tab-message-list-view'

      // NoChatSelected also has this ID and class.
      id='message-list-and-composer'
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
