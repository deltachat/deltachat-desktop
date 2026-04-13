import React, {
  useState,
  useEffect,
  forwardRef,
  PropsWithChildren,
  useRef,
  useContext,
} from 'react'
import classNames from 'classnames'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import EmojiPicker from '../EmojiPicker'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useMessage from '../../hooks/chat/useMessage'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'

import styles from './styles.module.scss'

import type { EmojiMartData } from '../EmojiPicker'
import {
  RovingTabindexProvider,
  useRovingTabindex,
} from '../../contexts/RovingTabindex'

type Props = {
  stickerPackName: string
  stickerPackImages: string[]
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
  onStickerDeleted: () => void
}

const DisplayedStickerPack = ({
  stickerPackName,
  stickerPackImages,
  chatId,
  setShowEmojiPicker,
  onStickerDeleted,
}: Props) => {
  const { jumpToMessage } = useMessage()
  const accountId = selectedAccountId()

  const listRef = useRef<HTMLDivElement>(null)

  const onClickSticker = (fileName: string) => {
    const stickerPath = fileName.replace('file://', '')
    BackendRemote.rpc.sendSticker(accountId, chatId, stickerPath).then(msgId =>
      jumpToMessage({
        accountId,
        msgId,
        msgChatId: chatId,
        highlight: false,
        focus: false,
      })
    )
    setShowEmojiPicker(false)
  }

  return (
    <div className='sticker-pack'>
      <div className='title'>{stickerPackName}</div>
      <div ref={listRef} className='container'>
        {/* Yes, we have separate `RovingTabindexProvider` for each
        sticker pack, instead of having one for all stickers.
        Users probably want to switch between sticker packs with Tab. */}
        <RovingTabindexProvider
          wrapperElementRef={listRef}
          direction='horizontal'
        >
          {stickerPackImages.map(filePath => (
            <StickersListItem
              key={filePath}
              filePath={filePath}
              onClick={() => onClickSticker(filePath)}
              onStickerDeleted={onStickerDeleted}
            />
          ))}
        </RovingTabindexProvider>
      </div>
    </div>
  )
}

function StickersListItem(props: {
  filePath: string
  onClick: () => void
  onStickerDeleted: () => void
}) {
  const { filePath, onClick, onStickerDeleted } = props
  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)
  const { openContextMenu } = useContext(ContextMenuContext)
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const onContextMenu = (ev: React.MouseEvent) => {
    ev.preventDefault()
    openContextMenu({
      x: ev.clientX,
      y: ev.clientY,
      items: [
        {
          label: tx('delete'),
          action: async () => {
            const confirmed = await openConfirmationDialog({
              message: tx('ask_delete_sticker'),
              isConfirmDanger: true,
            })
            if (confirmed) {
              await runtime.deleteSticker(filePath)
              onStickerDeleted()
            }
          },
        },
      ],
    })
  }

  return (
    <button
      type='button'
      ref={ref}
      className={'sticker ' + rovingTabindex.className}
      onClick={onClick}
      onContextMenu={onContextMenu}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <img src={runtime.transformStickerURL(filePath)} />
    </button>
  )
}

export const StickerPicker = ({
  role,
  id,
  labelledBy,
  stickers,
  chatId,
  setShowEmojiPicker,
  onStickerDeleted,
}: {
  role: 'tabpanel' | undefined
  id: string
  labelledBy: string
  stickers: { [key: string]: string[] }
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
  onStickerDeleted: () => void
}) => {
  const tx = useTranslationFunction()

  const stickerPackNames = Object.keys(stickers)

  return (
    <div
      role={role}
      id={id}
      aria-labelledby={labelledBy}
      className='sticker-picker'
    >
      <div className='sticker-container'>
        {stickerPackNames.map(name => (
          <DisplayedStickerPack
            chatId={chatId}
            key={name}
            stickerPackName={name}
            stickerPackImages={stickers[name]}
            setShowEmojiPicker={setShowEmojiPicker}
            onStickerDeleted={onStickerDeleted}
          />
        ))}
      </div>
      <div className='sticker-hint'>
        <p className='description'>{tx('sticker_picker_empty_hint')}</p>
      </div>
    </div>
  )
}

const EmojiOrStickerSelectorButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> &
    PropsWithChildren<{ onClick: () => void; isSelected: boolean }>
) => {
  const { isSelected, onClick, children, ...rest } = props
  return (
    <button
      type='button'
      {...rest}
      role='tab'
      aria-selected={isSelected}
      className={classNames('selector-button', {
        selected: isSelected,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export const EmojiAndStickerPicker = forwardRef<
  HTMLDivElement,
  {
    onEmojiSelect: (emoji: EmojiMartData) => void
    chatId: number
    setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>
    /**
     * Whether the sticker functionality should be completely hidden.
     * This is useful for the message editing mode.
     */
    hideStickerPicker?: boolean
  }
>((props, ref) => {
  const tx = useTranslationFunction()

  const accountId = selectedAccountId()
  const { onEmojiSelect, chatId, setShowEmojiPicker, hideStickerPicker } = props

  const [_showSticker, setShowSticker] = useState(false)
  const showSticker = hideStickerPicker ? false : _showSticker
  const [stickers, setStickers] = useState<{
    [key: string]: string[]
  }>({})

  const refreshStickers = () => {
    BackendRemote.rpc
      .miscGetStickers(accountId)
      .then(stickers => setStickers(stickers))
  }

  useEffect(() => {
    if (hideStickerPicker) {
      return
    }
    refreshStickers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hideStickerPicker])

  return (
    <div className={'emoji-sticker-picker'} ref={ref}>
      {!hideStickerPicker && (
        <div role='tablist' className='emoji-or-sticker-header-nav'>
          <EmojiOrStickerSelectorButton
            id='emoji-sticker-picker-tab-emoji'
            aria-controls='emoji-sticker-picker-tabpanel-emoji'
            onClick={() => setShowSticker(false)}
            isSelected={!showSticker}
          >
            {tx('emoji')}
          </EmojiOrStickerSelectorButton>
          <EmojiOrStickerSelectorButton
            id='emoji-sticker-picker-tab-sticker'
            aria-controls='emoji-sticker-picker-tabpanel-sticker'
            onClick={() => setShowSticker(true)}
            isSelected={showSticker}
          >
            {tx('sticker')}
          </EmojiOrStickerSelectorButton>
        </div>
      )}
      {!showSticker && (
        <EmojiPicker
          role='tabpanel'
          id='emoji-sticker-picker-tabpanel-emoji'
          labelledBy='emoji-sticker-picker-tab-emoji'
          className={styles.emojiPicker}
          full
          onSelect={onEmojiSelect}
        />
      )}
      {showSticker && (
        <StickerPicker
          role='tabpanel'
          id='emoji-sticker-picker-tabpanel-sticker'
          labelledBy='emoji-sticker-picker-tab-sticker'
          chatId={chatId}
          stickers={stickers}
          setShowEmojiPicker={setShowEmojiPicker}
          onStickerDeleted={refreshStickers}
        />
      )}
    </div>
  )
})
