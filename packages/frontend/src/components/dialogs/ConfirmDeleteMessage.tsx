import React, { useCallback, useContext } from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { BackendRemote, Type } from '../../backend-com'
import { C } from '@deltachat/jsonrpc-client'
import { ScreenContext } from '../../contexts/ScreenContext'
import { useFetch } from '../../hooks/useFetch'
import { unknownErrorToString } from '@deltachat-desktop/shared/unknownErrorToString'

export type Props = {
  accountId: number
  messageIds: Array<Type.Message['id']>
  /**
   * If some messages from {@linkcode messageIds} are already loaded,
   * provide them here for better performance.
   */
  loadedMessages: { [id: Type.Message['id']]: Type.Message | undefined }
  chat: Type.FullChat
} & DialogProps

export default function ConfirmDeleteMessageDialog(props: Props) {
  const tx = useTranslationFunction()
  const { userFeedback } = useContext(ScreenContext)

  const { accountId, chat, onClose, messageIds, loadedMessages } = props

  const deleteForAllPossibleFetch = useFetch(
    useCallback(async () => {
      if (!chat.canSend || chat.isSelfTalk || !chat.isEncrypted) {
        return false
      }

      // Check all the loaded messages
      function msgDeleteForAllPossible(msg: Type.Message): boolean {
        return msg.sender.id === C.DC_CONTACT_ID_SELF && !msg.isInfo
      }
      if (
        messageIds
          .map(id => loadedMessages[id])
          .filter(m => m != undefined)
          .some(m => !msgDeleteForAllPossible(m))
      ) {
        return false
      }
      const missingMessageIds = messageIds.filter(
        id => loadedMessages[id] == undefined
      )
      if (missingMessageIds.length === 0) {
        return true
      }

      // Still not decided. Load missing messages and check them as well.
      if (
        Object.values(
          await BackendRemote.rpc.getMessages(accountId, missingMessageIds)
        ).some((m, ind) => {
          if (m.kind === 'loadingError') {
            throw new Error(
              `Could not load message with ID ${missingMessageIds[ind]}`
            )
          }

          return !msgDeleteForAllPossible(m)
        })
      ) {
        return false
      }
      return true
    }, [
      accountId,
      chat.canSend,
      chat.isEncrypted,
      chat.isSelfTalk,
      loadedMessages,
      messageIds,
    ]),
    []
  )

  const deleteMessage = (deleteForEveryone: boolean) => {
    if (deleteForEveryone) {
      BackendRemote.rpc
        .deleteMessagesForAll(accountId, messageIds)
        .catch((err: Error) => {
          userFeedback({
            type: 'error',
            text: err.message,
          })
        })
    } else {
      BackendRemote.rpc
        .deleteMessages(accountId, messageIds)
        .catch((err: Error) => {
          userFeedback({
            type: 'error',
            text: err.message,
          })
        })
    }
    onClose()
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent>
          <p className='whitespace'>
            {messageIds.length > 1
              ? tx('ask_delete_messages', messageIds.length.toString(), {
                  quantity: messageIds.length,
                })
              : tx('ask_delete_message')}
          </p>
        </DialogContent>
        {deleteForAllPossibleFetch.result?.ok === false && (
          <p>
            {tx(
              'error_x',
              'Failed to check if we can delete the messages for everyone:\n' +
                unknownErrorToString(deleteForAllPossibleFetch.result.err)
            )}
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          {/* Don't show any buttons while loading
          to ensure that the user doesn't click the wrong one
          due to layout shifting when we finish loading.
          But display the actual (disabled) button element
          to ensure that the height of the dialog remains the same. */}
          <FooterActionButton
            onClick={() => onClose()}
            data-testid='cancel'
            disabled={deleteForAllPossibleFetch.loading}
          >
            {deleteForAllPossibleFetch.loading ? tx('loading') : tx('cancel')}
          </FooterActionButton>
          {deleteForAllPossibleFetch.loading ? (
            <p>{tx('loading')}</p>
          ) : (
            <>
              <FooterActionButton
                styling={'danger'}
                onClick={() => deleteMessage(false)}
                data-testid='delete_for_me'
              >
                {chat.isSelfTalk ? tx('delete') : tx('delete_for_me')}
              </FooterActionButton>
              {/* The error is handled above.
              One might think that it's better to show the button by default
              if we failed to check if deleting for everyone is possible,
              and then simply showing an error if Core returns an error.
              But we shouldn't do it until the behavior
              of `deleteMessagesForAll()` is clearly defined and documented. */}
              {deleteForAllPossibleFetch.result.ok &&
                deleteForAllPossibleFetch.result.value && (
                  <FooterActionButton
                    styling={'danger'}
                    onClick={() => deleteMessage(true)}
                    data-testid='delete_for_everyone'
                  >
                    {tx('delete_for_everyone')}
                  </FooterActionButton>
                )}
            </>
          )}
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
