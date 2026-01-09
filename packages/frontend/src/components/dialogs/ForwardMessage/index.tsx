import React, { useEffect, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { confirmForwardMessage } from '../../message/messageFunctions'
import { getConfiguredAccounts } from '../../../backend/account'
import { saveLastChatId } from '../../../backend/chat'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useMessage from '../../../hooks/chat/useMessage'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import SelectAccountDialog from '../SelectAccountDialog'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'
import SelectChat from '../SelectChat'

import styles from './styles.module.scss'
import { useRpcFetch } from '../../../hooks/useFetch'
import { Avatar } from '../../Avatar'

type ForwardMessageProps = {
  message: T.Message
  onClose: DialogProps['onClose']
}

export default function ForwardMessage(props: ForwardMessageProps) {
  const { message, onClose } = props

  const currentAccountId = selectedAccountId()
  const [targetAccountId, setTargetAccountId] = useState(currentAccountId)
  const [hasMultipleAccounts, setHasMultipleAccounts] = useState(false)

  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { selectChat } = useChat()
  const { forwardMessage, jumpToMessage } = useMessage()

  useEffect(() => {
    getConfiguredAccounts().then(accounts => {
      setHasMultipleAccounts(accounts.length > 1)
    })
  }, [])

  const onSwitchAccount = () => {
    openDialog(SelectAccountDialog, {
      onSelect: (accountId: number) => {
        setTargetAccountId(accountId)
      },
    })
  }
  const accountFetch = useRpcFetch(BackendRemote.rpc.getAccountInfo, [
    targetAccountId,
  ])
  const accountInfo = accountFetch.lingeringResult?.ok
    ? accountFetch.lingeringResult.value
    : null
  const color =
    accountInfo?.kind === 'Configured'
      ? accountInfo?.color || undefined
      : undefined

  const onChatClick = async (chatId: number) => {
    const isCrossAccountForward = targetAccountId !== currentAccountId

    const chat = await BackendRemote.rpc.getBasicChatInfo(
      targetAccountId,
      chatId
    )
    onClose()

    // If forwarding to a different account, we need to switch accounts first
    // saveLastChatId makes sure that the selected chat is opened after the switch
    if (isCrossAccountForward) {
      await saveLastChatId(targetAccountId, chat.id)
      await window.__selectAccount(targetAccountId)
    }

    if (!chat.isSelfTalk) {
      // show the target chat to avoid unintended forwarding to the wrong chat
      // For same-account forward, select chat directly
      // For cross-account forward, the chat is already selected via saveLastChatId
      if (!isCrossAccountForward) {
        selectChat(currentAccountId, chat.id)
      }
      const yes = await confirmForwardMessage(
        openDialog,
        currentAccountId,
        message,
        chat,
        isCrossAccountForward ? targetAccountId : undefined
      )
      if (yes) {
        // get the (new) id of forwarded message
        // and jump to the message
        const messageIds = await BackendRemote.rpc.getMessageIds(
          targetAccountId,
          chatId,
          false,
          true
        )
        const lastMessage = messageIds[messageIds.length - 1]
        if (lastMessage) {
          if (isCrossAccountForward) {
            // For cross-account, use the internal jump mechanism
            // since the hooks were created with the old account context
            window.__internal_jump_to_message_asap = {
              accountId: targetAccountId,
              chatId,
              jumpToMessageArgs: [
                {
                  msgId: lastMessage,
                  highlight: false,
                  focus: false,
                },
              ],
            }
            window.__internal_check_jump_to_message?.()
          } else {
            jumpToMessage({
              accountId: targetAccountId,
              msgId: lastMessage,
              msgChatId: chatId,
              focus: false,
            })
          }
        }
      } else {
        // If user cancels and we switched accounts, go back to original account and chat
        if (isCrossAccountForward) {
          await saveLastChatId(currentAccountId, message.chatId)
          await window.__selectAccount(currentAccountId)
        } else {
          selectChat(currentAccountId, message.chatId)
        }
      }
    } else {
      // Self-talk: forward without confirmation
      if (isCrossAccountForward) {
        await BackendRemote.rpc.forwardMessagesToAccount(
          currentAccountId,
          [message.id],
          targetAccountId,
          chat.id
        )
      } else {
        await forwardMessage(currentAccountId, message.id, chat.id)
      }
    }
  }

  const accountSwitch =
    hasMultipleAccounts && accountInfo?.kind === 'Configured' ? (
      <div className={styles.switchAccountContainer}>
        <button
          type='button'
          className={styles.switchAccountButton}
          onClick={onSwitchAccount}
          data-testid='switch-account-button'
        >
          <span className={styles.switchAccountText}>
            {tx('switch_account')}
          </span>
        </button>
        <Avatar
          displayName={accountInfo?.displayName || ''}
          avatarPath={accountInfo?.profileImage || undefined}
          color={color}
          small
        />
      </div>
    ) : undefined

  return (
    <SelectChat
      headerTitle={tx('forward_to')}
      onChatClick={onChatClick}
      onClose={onClose}
      listFlags={C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS}
      accountId={targetAccountId}
      accountSwitch={accountSwitch}
    />
  )
}
