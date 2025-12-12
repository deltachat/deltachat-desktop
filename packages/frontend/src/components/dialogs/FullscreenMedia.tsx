import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { throttle } from '@deltachat-desktop/shared/util'

import Dialog from '../Dialog'
import { IconButton } from '../Icon'
import { onDownload } from '../message/messageFunctions'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { isImage, isVideo, isAudio } from '../attachment/Attachment'
import { getLogger } from '../../../../shared/logger'
import { gitHubIssuesUrl } from '../../../../shared/constants'
import { useInitEffect } from '../helpers/hooks'
import { BackendRemote, onDCEvent, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useContextMenuWithActiveState } from '../ContextMenu'
import useMessage from '../../hooks/chat/useMessage'

import type { DialogProps } from '../../contexts/DialogContext'

const log = getLogger('renderer/fullscreen_media')

/** wraps a callback so that `event.preventDefault()` is called before it */
export function preventDefault<EventType extends React.SyntheticEvent | Event>(
  callback: () => void
) {
  const wrapper = (cb: () => void, ev: EventType) => {
    ev.preventDefault()
    cb()
  }
  return wrapper.bind(null, callback)
}

export enum NeighboringMediaMode {
  Chat,
  Global,
  Off,
}

type Props = {
  msg: Type.Message
  neighboringMedia: NeighboringMediaMode
}

export default function FullscreenMedia(props: Props & DialogProps) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { jumpToMessage } = useMessage()
  const { onClose } = props

  const [msg, setMsg] = useState(props.msg)
  const resetImageZoom = useRef<(() => void) | null>(null) as React.RefObject<
    (() => void) | null
  >
  const previousNextMessageId = useRef<[number | null, number | null]>([
    null,
    null,
  ])
  const [showPreviousNextMessageButtons, setShowPrevNextMsgBtns] = useState({
    previous: false,
    next: false,
  })

  const [mediaMessageList, setMediaMessageList] = useState<number[]>([])
  useEffect(() => {
    const update = () => {
      if (props.neighboringMedia === NeighboringMediaMode.Off) {
        setMediaMessageList([])
      } else {
        const { viewType, chatId } = props.msg
        // workaround to get gifs and images into the same media list
        let additionalViewType: Type.Viewtype | null = null
        if (props.msg.viewType === 'Image') {
          additionalViewType = 'Gif'
        } else if (props.msg.viewType === 'Gif') {
          additionalViewType = 'Image'
        }
        const scope =
          props.neighboringMedia === NeighboringMediaMode.Global ? null : chatId
        BackendRemote.rpc
          .getChatMedia(accountId, scope, viewType, additionalViewType, null)
          .then(setMediaMessageList)
      }
    }
    update()
    const throttledUpdate = throttle(update, 400)
    const listeners = [
      onDCEvent(accountId, 'MsgsChanged', throttledUpdate),
      onDCEvent(accountId, 'IncomingMsgBunch', throttledUpdate),
      onDCEvent(accountId, 'MsgDeleted', throttledUpdate),
    ]
    return () => {
      listeners.forEach(cleanup => cleanup())
    }
  }, [props.msg, props.neighboringMedia, accountId])

  const { file, fileMime } = msg

  if (!file) {
    log.error('file attribute not set in message', msg)
    throw new Error('file attribute not set')
  }

  const { isContextMenuActive, onContextMenu } = useContextMenuWithActiveState([
    {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        runtime.writeClipboardImage(file)
      },
    },
    {
      label: tx('menu_export_attachment'),
      action: onDownload.bind(null, msg),
    },
    {
      label: tx('show_in_chat'),
      action: () => {
        jumpToMessage({
          accountId,
          msgId: msg.id,
          msgChatId: msg.chatId,
          focus: true,
          scrollIntoViewArg: { block: 'center' },
        })
        onClose()
      },
    },
  ])

  let elm = null

  if (isImage(fileMime)) {
    const imageHeight =
      msg.dimensionsHeight < 300 ? 2 * msg.dimensionsHeight : ''
    elm = (
      <div className='image-container'>
        <TransformWrapper
          initialScale={1}
          wheel={{
            wheelDisabled: true,
          }}
          panning={{
            wheelPanning: true,
          }}
        >
          {utils => {
            resetImageZoom.current = () => {
              utils.resetTransform()
            }
            return (
              <TransformComponent
                wrapperStyle={{
                  maxWidth: '100%',
                  maxHeight: '100vh',
                }}
                contentStyle={{
                  padding: '0',
                }}
              >
                <div
                  className='image-context-menu-container'
                  onContextMenu={onContextMenu}
                  aria-haspopup='menu'
                  tabIndex={0}
                >
                  <img
                    // Otherwise it's 'inline' and the parent gets
                    // stretched a few pixels taller than the image itself,
                    // resulting in the image overflowing the window.
                    // See https://github.com/deltachat/deltachat-desktop/issues/4320
                    style={{ display: 'block' }}
                    src={runtime.transformBlobURL(file)}
                    height={imageHeight}
                  />
                </div>
              </TransformComponent>
            )
          }}
        </TransformWrapper>
      </div>
    )
  } else if (isAudio(fileMime)) {
    elm = <audio src={runtime.transformBlobURL(file)} controls />
  } else if (isVideo(fileMime)) {
    elm = <video src={runtime.transformBlobURL(file)} controls autoPlay />
  } else if (!fileMime) {
    // no file mime
    elm = (
      <div>
        <p>Error: Unknown mimeType for {runtime.transformBlobURL(file)}</p>
        <p>mimeType is "{fileMime}"</p>
        <p>
          Please report this bug on{' '}
          <a href='#' onClick={() => runtime.openLink(gitHubIssuesUrl)}>
            github
          </a>
        </p>
      </div>
    )
    log.warn('Unknown mime type', { file, fileMime })
  } else {
    // can not be displayed by fullscreen media
    elm = (
      <div>
        <p>
          Error: Desktop issue: Unknown media type for{' '}
          {runtime.transformBlobURL(file)} (mimetype: {fileMime})
        </p>
        <p>
          Please report this bug on{' '}
          <a href='#' onClick={() => runtime.openLink(gitHubIssuesUrl)}>
            github
          </a>
        </p>
      </div>
    )
    log.warn('Unknown media type for fullscreen media', {
      file,
      fileMime,
    })
  }
  const updatePreviousNextMessageId = useCallback(async () => {
    if (!msg.id) {
      return
    }
    previousNextMessageId.current = await getNeighboringMsgIds(
      msg.id,
      mediaMessageList
    )
    setShowPrevNextMsgBtns({
      previous: previousNextMessageId.current[0] !== null,
      next: previousNextMessageId.current[1] !== null,
    })
  }, [msg, mediaMessageList])

  useEffect(() => {
    updatePreviousNextMessageId()
  }, [msg, updatePreviousNextMessageId])
  useInitEffect(() => updatePreviousNextMessageId())

  const { previousImage, nextImage } = useMemo(() => {
    const loadMessage = async (msgID: number) => {
      if (msgID === 0) return
      const message = await BackendRemote.rpc.getMessage(
        selectedAccountId(),
        msgID
      )
      if (message === null) return
      setMsg(message)
      if (resetImageZoom.current !== null) {
        resetImageZoom.current()
      }
    }
    return {
      previousImage: () => loadMessage(previousNextMessageId.current[0] || 0),
      nextImage: () => loadMessage(previousNextMessageId.current[1] || 0),
    }
  }, [previousNextMessageId, setMsg])

  useEffect(() => {
    // use events directly for now
    // this will need adjustment to the keybindings manager once we have proper screen management
    // where we can know exactly which screen / menu / dialog is focused
    // and only send the context dependend keys to there
    // for now limit only to left/right arrow to not mess up Escape-handling for dialog
    const listener = (ev: KeyboardEvent) => {
      if (ev.repeat) {
        return
      }
      if (ev.code === 'Escape' && isContextMenuActive) {
        // Only close the context menu, instead of closing both
        // the context menu and the whole FullscreenMedia dialog.
        ev.preventDefault()
        return
      }
      const left = ev.code === 'ArrowLeft'
      const right = ev.code === 'ArrowRight'
      if (!left && !right) {
        return
      }
      ev.preventDefault()
      ev.stopPropagation()
      if (left) {
        previousImage()
      } else if (right) {
        nextImage()
      }
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [previousImage, nextImage, isContextMenuActive])

  if (!msg || !msg.file) return elm

  return (
    <Dialog unstyled onClose={onClose}>
      <div className='attachment-view'>{elm}</div>
      {runtime.getRuntimeInfo().isMac && (
        <div className='attachment-view-drag-bar' data-tauri-drag-region></div>
      )}
      {elm && (
        <div className='btn-wrapper' data-no-drag-region>
          <IconButton
            onClick={onDownload.bind(null, msg)}
            icon='download'
            size={32}
            coloring='fullscreenControls'
            aria-label={tx('save')}
          />
          <IconButton
            onClick={onClose}
            icon='cross'
            size={32}
            coloring='fullscreenControls'
            aria-label={tx('close')}
          />
        </div>
      )}
      {showPreviousNextMessageButtons.previous && (
        <div className='media-previous-button'>
          <IconButton
            // eslint-disable-next-line react-hooks/refs
            onClick={preventDefault(previousImage)}
            icon='chevron-left'
            coloring='fullscreenControls'
            size={60}
            aria-label='⬅️'
          />
        </div>
      )}
      {showPreviousNextMessageButtons.next && (
        <div className='media-next-button'>
          <IconButton
            // eslint-disable-next-line react-hooks/refs
            onClick={preventDefault(nextImage)}
            icon='chevron-right'
            coloring='fullscreenControls'
            size={60}
            aria-label='➡️'
          />
        </div>
      )}
    </Dialog>
  )
}

async function getNeighboringMsgIds(messageId: number, list: number[]) {
  const index = list.indexOf(messageId)
  return [list[index - 1] || null, list[index + 1] || null] as [
    previousMessageId: number | null,
    nextMessageId: number | null,
  ]
}
