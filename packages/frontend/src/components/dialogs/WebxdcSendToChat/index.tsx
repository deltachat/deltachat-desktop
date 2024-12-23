import React, { useCallback, useRef, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'
import AutoSizer from 'react-virtualized-auto-sizer'
import classNames from 'classnames'

import ChatListItem from '../../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../../chat/ChatList'
import { useChatList } from '../../chat/ChatListHelpers'
import { useThemeCssVar } from '../../../ThemeManager'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import Dialog, {
  DialogBody,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import ConfirmationDialog from '../ConfirmationDialog'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'

type Props = {
  messageText: string | null
  file: { file_name: string; file_content: string } | null
} & DialogProps

const LIST_FLAGS = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS

export default function WebxdcSaveToChatDialog(props: Props) {
  const { onClose, messageText, file } = props

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const sendToChatAction = useSendToChatAction()
  const [queryStr, setQueryStr] = useState('')
  const { chatListIds } = useChatList(LIST_FLAGS, queryStr)
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

  const resultsRef = useRef<HTMLDivElement>(null)

  const onChatClick = async (chatId: number) => {
    let path = null
    if (file) {
      path = await runtime.writeTempFileFromBase64(
        file.file_name,
        file.file_content
      )
    }
    await sendToChatAction(accountId, chatId, messageText, path)
    if (path) {
      await runtime.removeTempFile(path)
    }
    onClose()
  }

  const onSaveClick = async () => {
    if (file) {
      const tmp_file = await runtime.writeTempFileFromBase64(
        file.file_name,
        file.file_content
      )
      onClose()
      await runtime.downloadFile(tmp_file, file.file_name)
      await runtime.removeTempFile(tmp_file)
    }
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  const title = file
    ? tx('send_file_to', file.file_name)
    : tx('send_message_to')

  const noResults = chatListIds.length === 0 && queryStr !== ''
  return (
    <Dialog className={styles.sendToChatDialog} onClose={onClose} fixed>
      <DialogHeader onClose={onClose} title={title} />
      <DialogBody
        className={classNames(
          'webxdc-send-to-chat-dialog',
          styles.sendToChatDialogBody
        )}
      >
        <input
          className='search-input no-drag'
          onChange={onSearchChange}
          value={queryStr}
          placeholder={tx('search')}
          autoFocus
          spellCheck={false}
        />
        {noResults && queryStr && (
          <PseudoListItemNoSearchResults queryStr={queryStr} />
        )}
        <div
          ref={resultsRef}
          className='results'
          style={{ height: noResults ? '0px' : '100%' }}
        >
          <RovingTabindexProvider wrapperElementRef={resultsRef}>
            <AutoSizer>
              {({ width, height }) => (
                <ChatListPart
                  isRowLoaded={isChatLoaded}
                  loadMoreRows={loadChats}
                  rowCount={chatListIds.length}
                  width={width}
                  height={height}
                  itemKey={index => 'key' + chatListIds[index]}
                  itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                >
                  {({ index, style }) => {
                    const chatId = chatListIds[index]
                    return (
                      <div style={style}>
                        <ChatListItem
                          chatListItem={chatCache[chatId] || undefined}
                          onClick={onChatClick.bind(null, chatId)}
                        />
                      </div>
                    )
                  }}
                </ChatListPart>
              )}
            </AutoSizer>
          </RovingTabindexProvider>
        </div>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='start'>
          {file && (
            <FooterActionButton onClick={onSaveClick}>
              {tx('save_as')}
            </FooterActionButton>
          )}
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}

function useSendToChatAction() {
  const { openDialog } = useDialog()
  const { selectChat } = useChat()
  const tx = useTranslationFunction()

  return useCallback(
    async (
      accountId: number,
      chatId: number,
      messageText: string | null,
      file: string | null
    ) => {
      const chatP = BackendRemote.rpc.getBasicChatInfo(accountId, chatId)
      const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

      selectChat(accountId, chatId)

      if (draft) {
        // ask if the draft should be replaced
        const chat = await chatP
        const continueProcess = await new Promise((resolve, _reject) => {
          openDialog(ConfirmationDialog, {
            message: tx('confirm_replace_draft', chat.name),
            confirmLabel: tx('replace_draft'),
            cb: resolve,
          })
        })
        if (!continueProcess) {
          return
        }
      }

      await BackendRemote.rpc.miscSetDraft(
        accountId,
        chatId,
        messageText,
        file,
        null,
        file ? 'File' : 'Text'
      )

      window.__reloadDraft && window.__reloadDraft()
    },
    [tx, openDialog, selectChat]
  )
}
