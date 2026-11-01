import React, { useEffect, useEffectEvent } from 'react'
import classNames from 'classnames'

import { BackendRemote, onDCEvent } from '../../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { useRpcFetch } from '../../../hooks/useFetch'
import useMessage from '../../../hooks/chat/useMessage'
import usePinnedMessages from '../../../hooks/chat/usePinnedMessages'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import Button from '../../Button'
import { openWebxdc } from '../messageFunctions'

import styles from './styles.module.css'

const MAX_POSITION_DOTS = 5
/** The banner shows a single line only */
const SUMMARY_APPROX_CHARS = 100

type Props = {
  accountId: number
  chatId: number
}

/**
 * Shows one pinned message of the chat at a time.
 * Clicking it jumps to that message and shows the next older one.
 */
export default function PinnedMessagesBanner({ accountId, chatId }: Props) {
  const tx = useTranslationFunction()
  const { jumpToMessage } = useMessage()
  const { pinnedIds, shownId, showNext } = usePinnedMessages(accountId, chatId)

  const messageFetch = useRpcFetch(
    BackendRemote.rpc.getMessage,
    shownId === null ? null : [accountId, shownId]
  )
  const message =
    messageFetch?.lingeringResult?.ok === true
      ? messageFetch.lingeringResult.value
      : null
  const isWebxdc = message?.viewType === 'Webxdc'
  const thumbnail =
    message?.file &&
    (message.viewType === 'Image' ||
      message.viewType === 'Gif' ||
      message.viewType === 'Sticker')
      ? message.file
      : null

  // No "Forwarded" hint, as the sender isn't shown either.
  // Show type emoji only if there is no thumbnail.
  const summaryFetch = useRpcFetch(
    BackendRemote.rpc.getMessageSummaryText,
    shownId === null
      ? null
      : [accountId, shownId, false, thumbnail === null, SUMMARY_APPROX_CHARS]
  )
  const webxdcInfoFetch = useRpcFetch(
    BackendRemote.rpc.getWebxdcInfo,
    shownId === null || !isWebxdc ? null : [accountId, shownId]
  )
  const refresh = useEffectEvent(() => {
    messageFetch?.refresh()
    summaryFetch?.refresh()
    // Changes of the app's document or summary also emit `MsgsChanged`.
    webxdcInfoFetch?.refresh()
  })
  useEffect(() => {
    if (shownId === null) {
      return
    }
    return onDCEvent(accountId, 'MsgsChanged', ({ msgId }) => {
      if (msgId === shownId) {
        refresh()
      }
    })
  }, [accountId, shownId])

  if (shownId === null) {
    return null
  }

  const summary =
    summaryFetch?.lingeringResult?.ok === true
      ? summaryFetch.lingeringResult.value
      : null
  const webxdcInfo =
    isWebxdc && webxdcInfoFetch?.lingeringResult?.ok === true
      ? webxdcInfoFetch.lingeringResult.value
      : null
  const index = pinnedIds.indexOf(shownId)

  const onClick = () => {
    jumpToMessage({
      accountId,
      msgId: shownId,
      msgChatId: chatId,
      highlight: true,
      focus: false,
      scrollIntoViewArg: { block: 'center' },
    })
    showNext()
  }

  return (
    <section aria-label={tx('pinned')} className={styles.pinnedMessagesBanner}>
      <button type='button' className={styles.jumpButton} onClick={onClick}>
        {pinnedIds.length > 1 && (
          <PositionDots index={index} count={pinnedIds.length} />
        )}
        <span className='visually-hidden'>
          {pinnedIds.length > 1 && ` ${index + 1}/${pinnedIds.length}`}
        </span>
        {thumbnail && (
          <img
            className={styles.thumbnail}
            src={runtime.transformBlobURL(thumbnail)}
            alt=''
          />
        )}
        {isWebxdc ? (
          <>
            <img
              className={styles.thumbnail}
              src={runtime.getWebxdcIconURL(accountId, message.id)}
              alt=''
            />
            <span className={styles.webxdcText}>
              <span className={styles.summary}>
                {webxdcInfo?.document || webxdcInfo?.name}
              </span>
              {webxdcInfo?.summary && (
                <span className={styles.webxdcSummary}>
                  {webxdcInfo.summary}
                </span>
              )}
            </span>
          </>
        ) : (
          <>
            <span className={styles.summary}>{summary}</span>
            <span className={styles.pinIcon} aria-hidden='true' />
          </>
        )}
      </button>
      {isWebxdc && (
        <Button
          className={styles.startButton}
          styling='primary'
          onClick={() => openWebxdc(message, webxdcInfo ?? undefined)}
        >
          {tx('start_app')}
        </Button>
      )}
    </section>
  )
}

/**
 * Vertical page indicator. Oldest pinned message is at the top.
 * With more than MAX_POSITION_DOTS pinned messages the middle dot
 * is active for all messages in the middle of the list
 */
function PositionDots({ index, count }: { index: number; count: number }) {
  const visibleCount = Math.min(count, MAX_POSITION_DOTS)
  const first = Math.min(
    Math.max(index - Math.floor(visibleCount / 2), 0),
    count - visibleCount
  )
  return (
    <span className={styles.positionDots} aria-hidden='true'>
      {Array.from({ length: visibleCount }, (_, i) => first + i).map(i => (
        <span
          key={i}
          className={classNames(styles.dot, i === index && styles.activeDot)}
        />
      ))}
    </span>
  )
}
