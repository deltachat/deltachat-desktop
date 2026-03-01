import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react'
import { default as asyncThrottle } from '@jcoreio/async-throttle'
import { MediaPlayerMutexContext } from './MediaPlayerMutexContext'
import { useFetch } from '../hooks/useFetch'
import { BackendRemote, onDCEvent } from '../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { useHasChanged2 } from '../hooks/useHasChanged'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('NextVoiceMessagePlayerContext')

type AudioMessageInfo = {
  accountId: number
  chatId: number
  messageId: number
  src: string
}

type ContextValue = {
  setCurrMessage: (newMsg: AudioMessageInfo | null) => void
}
export const NextVoiceMessagePlayerContext = createContext<ContextValue>({
  setCurrMessage: () => {},
})

/**
 * When the global media player finishes playing the current voice message,
 * this component will make it play the next one.
 */
export function NextVoiceMessagePlayerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const mediaPlayerMutexCtx = useContext(MediaPlayerMutexContext)

  const [currMessage, setCurrMessage] = useState<null | AudioMessageInfo>(null)

  const { nextMessage, nextMessageIsLoading } =
    useGetNextVoiceMessage(currMessage)

  const [pendingEndedEvent, setPendingEndedEvent] = useState<{
    src: string
  } | null>(null)

  const onEndedPlaybackAndLoadedNextMessage = useCallback(
    (endedSrc: string, _nextMessageIsLoading: false) => {
      if (nextMessage == null) {
        log.info('no next voice message to play, stopping sequential playback')
        mediaPlayerMutexCtx.stop()
        setCurrMessage(null)
        return
      }

      if (currMessage == null || endedSrc !== currMessage.src) {
        return
      }

      const { accountId, message } = nextMessage

      if (!message.file) {
        log.warn(
          'wanted to play next voice message, but its file is',
          message.file
        )
        return
      }
      const src = runtime.transformBlobURL(message.file)

      setCurrMessage({
        accountId,
        chatId: message.chatId,
        messageId: message.id,
        src,
      })
      // Actually start playing the media.
      mediaPlayerMutexCtx.play(src)
    },
    [currMessage, mediaPlayerMutexCtx, nextMessage]
  )

  const onEnded = useEffectEvent(() => {
    if (mediaPlayerMutexCtx.currentSrc == null) {
      log.warn(
        'ended event on global media player fired, but `mediaPlayerMutexCtx.currentSrc` is somehow',
        mediaPlayerMutexCtx.currentSrc
      )
      return
    }

    if (nextMessageIsLoading) {
      setPendingEndedEvent({ src: mediaPlayerMutexCtx.currentSrc })
    } else {
      onEndedPlaybackAndLoadedNextMessage(
        mediaPlayerMutexCtx.currentSrc,
        nextMessageIsLoading
      )
    }
  })
  useEffect(() => {
    const el = mediaPlayerMutexCtx.audioElement
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('ended', onEnded)
    }
  }, [mediaPlayerMutexCtx.audioElement])

  if (
    useHasChanged2(nextMessageIsLoading) &&
    !nextMessageIsLoading &&
    pendingEndedEvent != null
  ) {
    onEndedPlaybackAndLoadedNextMessage(
      pendingEndedEvent.src,
      nextMessageIsLoading
    )
    setPendingEndedEvent(null)
  }

  return (
    <NextVoiceMessagePlayerContext.Provider value={{ setCurrMessage }}>
      {children}
    </NextVoiceMessagePlayerContext.Provider>
  )
}

function useGetNextVoiceMessage(currMessage: null | AudioMessageInfo) {
  const audioMessageIds = useFetch(
    useMemo(
      () =>
        asyncThrottle(
          BackendRemote.rpc.getChatMedia.bind(BackendRemote.rpc),
          200
        ),
      []
    ),
    currMessage != null
      ? ([
          currMessage.accountId,
          currMessage.chatId,
          'Voice',
          // Note that there is also 'Audio'.
          null,
          null,
        ] as const)
      : null
  )

  const onMsgListChanged = useEffectEvent(
    ({ chatId }: { chatId: number; msgId: number }) => {
      if (currMessage == null) {
        return
      }
      if (chatId !== currMessage.chatId) {
        return
      }

      // TODO perf: It's not super efficient to refresh the entire list
      // if e.g. we only received one message.
      // Also we don't need to refresh the list
      // if we already have the next message (unless it got deleted / edited).
      audioMessageIds?.refresh()
    }
  )
  const currMessageAccountId = currMessage?.accountId
  useEffect(() => {
    if (currMessageAccountId == null) {
      return
    }
    const cleanup = [
      onDCEvent(currMessageAccountId, 'IncomingMsg', onMsgListChanged),
      onDCEvent(currMessageAccountId, 'MsgDeleted', onMsgListChanged),
      // `IncomingMsg` and `MsgDeleted` should be enough as of writing,
      // (although they don't fire when we send a message)
      // but let's listen for all kinds of changes to be safe.
      onDCEvent(currMessageAccountId, 'MsgsChanged', onMsgListChanged),
    ]
    return () => cleanup.forEach(off => off())
  }, [currMessageAccountId])

  const nextMessageId = useMemo(() => {
    if (audioMessageIds?.result?.ok !== true) {
      return null
    }
    if (currMessage == null) {
      return null
    }
    const ind = audioMessageIds.result.value.indexOf(currMessage.messageId)
    if (ind === -1) {
      return null
    }
    const next = audioMessageIds.result.value[ind + 1]
    if (next == undefined) {
      return null
    }
    return next
  }, [audioMessageIds?.result, currMessage])
  const nextMessageFetch = useFetch(
    useCallback(
      async (accountId: number, messageId: number) => ({
        message: await BackendRemote.rpc.getMessage(accountId, messageId),
        accountId,
      }),
      []
    ),
    currMessage == null || nextMessageId == null
      ? null
      : [currMessage.accountId, nextMessageId]
  )
  const nextMessageIsLoading =
    (audioMessageIds?.loading || nextMessageFetch?.loading) ?? false

  return {
    nextMessageIsLoading,
    nextMessage: nextMessageFetch?.result?.ok
      ? nextMessageFetch.result.value
      : null,
  }
}
