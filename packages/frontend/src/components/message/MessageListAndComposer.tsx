import React, { useRef, useEffect, useCallback } from 'react'
import { join, parse } from 'path'
import { Viewtype } from '@deltachat/jsonrpc-client/dist/generated/types'

import Composer, { useDraft } from '../composer/Composer'
import { getLogger } from '../../../../shared/logger'
import MessageList from './MessageList'
import ComposerMessageInput from '../composer/ComposerMessageInput'
import { DesktopSettingsType } from '../../../../shared/shared-types'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { useSettingsStore } from '../../stores/settings'
import ConfirmSendingFiles from '../dialogs/ConfirmSendingFiles'
import { ReactionsBarProvider } from '../ReactionsBar'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'

import type { T } from '@deltachat/jsonrpc-client'
import AlertDialog from '../dialogs/AlertDialog'

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
    accountId,
    chat.id,
    chat.isContactRequest,
    chat.isProtectionBroken,
    messageInputRef
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
        reader.onload = event => {
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
      const msgViewType: Viewtype = file.type.startsWith('image')
        ? 'Image'
        : 'File'

      const path = await writeTempFileFromFile(sanitizedFileList[0])
      await addFileToDraft(path, msgViewType)
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
          sendMessage(accountId, chat.id, {
            file: path,
            viewtype: 'File',
          }).then(() => {
            // start sending other files, don't wait until last file is sent
            runtime.removeTempFile(path)
          })
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

  const settingsStore = useSettingsStore()[0]
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
