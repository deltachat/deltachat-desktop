import React, { useCallback, useMemo, useState } from 'react'
import type { T } from '@deltachat/jsonrpc-client'
import { getLogger } from '@deltachat-desktop/shared/logger'
import {
  RovingTabindexProvider,
  useRovingTabindex,
} from '../../contexts/RovingTabindex'
import { useMultiselect } from '../../hooks/useMultiselect'

const log = getLogger('messageFocusAndMultiselect')

type MessageMultiselectContextValue = ReturnType<
  typeof useMultiselect<T.Message['id']>
> & {
  resetSelection: () => void
}
const MessageMultiselectContext =
  React.createContext<MessageMultiselectContextValue>({
    onClick: () => false,
    onFocus: () => {},
    onKeyDown: () => false,
    selectedItems: new Set(),
    resetSelection: () => {},
  })

export function FocusAndMultiselectProvider(
  props: React.PropsWithChildren<{
    wrapperElementRef: Parameters<
      typeof RovingTabindexProvider
    >[0]['wrapperElementRef']
    messageIds: Array<T.Message['id']>
  }>
) {
  const [selectedMessages_, setSelectedMessages] = useState(
    new Set<T.Message['id']>()
  )
  // As messages get deleted (possibly by other chat members
  // or from another device), remove them from selection.
  const selectedMessages = useMemo(() => {
    const newSelectedMessages = new Set(selectedMessages_)
    for (const id of selectedMessages_) {
      if (!props.messageIds.includes(id)) {
        newSelectedMessages.delete(id)
      }
    }
    return selectedMessages_.size === newSelectedMessages.size
      ? selectedMessages_
      : newSelectedMessages
  }, [props.messageIds, selectedMessages_])

  const resetSelection = useCallback(() => {
    setSelectedMessages(s => {
      if (s.size === 0) {
        return s
      }
      return new Set()
    })
  }, [])

  const multiselect = useMultiselect(
    props.messageIds,
    selectedMessages,
    setSelectedMessages,
    log
  )
  return (
    <RovingTabindexProvider wrapperElementRef={props.wrapperElementRef}>
      <MessageMultiselectContext.Provider
        value={{ ...multiselect, resetSelection }}
      >
        {props.children}
      </MessageMultiselectContext.Provider>
    </RovingTabindexProvider>
  )
}

export function useMessageFocusAndMultiselect(
  messageId: T.Message['id'],
  elementRef: Parameters<typeof useRovingTabindex>[0]
) {
  const rovingTabindex = useRovingTabindex(elementRef)
  const multiselect = React.useContext(MessageMultiselectContext)

  return {
    ...(rovingTabindex as Omit<
      typeof rovingTabindex,
      'onKeydown' | 'setAsActiveElement'
    >),
    ...multiselect,
    onClick: useCallback(
      (e: React.MouseEvent) => {
        const shouldPreventDefault = multiselect.onClick(e, messageId)
        if (shouldPreventDefault) {
          e.preventDefault()
        }
      },
      [messageId, multiselect]
    ),
    onFocus: useCallback(() => {
      rovingTabindex.setAsActiveElement()

      // Commented out for now. This disables the "Shift + ArrowDown
      // for contiguous selection" behavior, because it's a little buggy:
      // Pressing Shift + Tab would change selection
      // even if the user is simply trying to tab through the app.
      // Keyboard users can still utilize Shift + Space.
      // multiselect.onFocus(messageId)
    }, [rovingTabindex]),

    onKeyDown: useCallback(
      (e: React.KeyboardEvent) => {
        rovingTabindex.onKeydown(e)
        const shouldPreventDefault = multiselect.onKeyDown(e, messageId)
        if (shouldPreventDefault) {
          e.preventDefault()
        }
      },
      [messageId, multiselect, rovingTabindex]
    ),
  }
}
