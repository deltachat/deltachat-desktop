import React, {
  useState,
  useEffect,
  useCallback,
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
  setShowEmojiPicker: (enabled: boolean) => void
  onStickerDeleted: () => void
  onStickerClick: (stickerPath: string) => void
}

const DisplayedStickerPack = ({
  stickerPackName,
  stickerPackImages,
  setShowEmojiPicker,
  onStickerDeleted,
  onStickerClick,
}: Props) => {
  const listRef = useRef<HTMLDivElement>(null)

  const onClickSticker = (fileName: string) => {
    const stickerPath = fileName.replace('file://', '')
    onStickerClick(stickerPath)
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
          label: tx('menu_copy_image_to_clipboard'),
          action: () => {
            runtime.writeClipboardImage(filePath)
          },
        },
        { type: 'separator' },
        {
          label: tx('delete'),
          danger: true,
          action: async () => {
            const confirmed = await openConfirmationDialog({
              message: tx('ask_delete_sticker'),
              confirmLabel: tx('delete'),
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
      aria-haspopup='menu'
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
  setShowEmojiPicker,
  onStickerDeleted,
  onStickerClick,
}: {
  role: 'tabpanel' | undefined
  id: string
  labelledBy: string
  stickers: { [key: string]: string[] }
  setShowEmojiPicker: (enabled: boolean) => void
  onStickerDeleted: () => void
  onStickerClick: (stickerPath: string) => void
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
      {stickerPackNames.length > 0 ? (
        <>
          <div className='sticker-container'>
            {stickerPackNames.map(name => (
              <DisplayedStickerPack
                key={name}
                stickerPackName={name}
                stickerPackImages={stickers[name]}
                setShowEmojiPicker={setShowEmojiPicker}
                onStickerDeleted={onStickerDeleted}
                onStickerClick={onStickerClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div className='sticker-container'>
          <div className='no-stickers'>
            <p className='description'>{tx('add_stickers_instructions')}</p>
          </div>
        </div>
      )}
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
    onStickerClick: (stickerPath: string) => void
  }
>((props, ref) => {
  const tx = useTranslationFunction()

  const accountId = selectedAccountId()
  const {
    onEmojiSelect,
    setShowEmojiPicker,
    hideStickerPicker,
    onStickerClick,
  } = props

  const [_showSticker, setShowSticker] = useState(false)
  const showSticker = hideStickerPicker ? false : _showSticker
  const [stickers, setStickers] = useState<{
    [key: string]: string[]
  }>({})

  const refreshStickers = useCallback(() => {
    BackendRemote.rpc
      .miscGetStickers(accountId)
      .then(stickers => setStickers(stickers))
  }, [accountId])

  useEffect(() => {
    if (hideStickerPicker) {
      return
    }
    refreshStickers()
  }, [refreshStickers, hideStickerPicker])

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
          stickers={stickers}
          setShowEmojiPicker={setShowEmojiPicker}
          onStickerDeleted={refreshStickers}
          onStickerClick={onStickerClick}
        />
      )}
    </div>
  )
})
