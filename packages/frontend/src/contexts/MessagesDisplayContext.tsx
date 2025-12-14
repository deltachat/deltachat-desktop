import { createContext } from 'react'

type MessagesDisplayContextValue =
  | { context: 'chat_messagelist'; chatId: number; isDeviceChat: boolean }
  | {
      context: 'contact_profile_status'
      contact_id: number
      closeProfileDialog: () => void
    }
  | null

/**
 * Additional context for message body rendering.
 *
 * This context is currently only used by bot command suggestions
 * that they know in which chat they need to set/replace the draft
 */
export const MessagesDisplayContext =
  createContext<MessagesDisplayContextValue>(null)
