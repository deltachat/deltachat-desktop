import { useCallback } from 'react'

import useChat from './useChat'
import { getLogger } from '@deltachat-desktop/shared/logger'
import type { T } from '@deltachat/jsonrpc-client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { runtime } from '@deltachat-desktop/runtime-interface'

const log = getLogger('useCreateDraftMessage')

export type CreateDraftMessage = (
  accountId: number,
  chatId: number,
  messageText: string,
  file?: {
    path: string
    name?: string
    viewType?: T.Viewtype
    /**
     * If the provided file is a temp file, set this to `true`,
     * and the file will be deleted (with {@linkcode runtime.removeTempFile})
     * when we're done adding it to the draft (or if something failed).
     */
    deleteTempFileWhenDone: boolean
  }
) => Promise<void>

/**
 * Create draft message in given chat.
 *
 * In case a draft message already exists, the user is asked if they want to
 * replace it.
 */
export default function useCreateDraftMessage() {
  const { selectChat } = useChat()

  return useCallback<CreateDraftMessage>(
    async (accountId, chatId, messageText, file) => {
      selectChat(accountId, chatId)

      if (window.__setDraftRequest != undefined) {
        log.error('previous createDraftMessage has not worked?')
      }
      window.__setDraftRequest = {
        accountId,
        chatId,
        file: file
          ? {
              ...file,
              // Should we make `viewType` required?
              viewType: file.viewType ?? 'File',
            }
          : undefined,
        text: messageText,
      }
      window.__checkSetDraftRequest?.()
    },
    [selectChat]
  )
}
