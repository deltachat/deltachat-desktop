import React, {
  useState,
  useEffect,
  forwardRef,
  PropsWithChildren,
  useRef,
} from 'react'
import classNames from 'classnames'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import EmojiPicker from '../EmojiPicker'
import Button from '../Button'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useMessage from '../../hooks/chat/useMessage'

import styles from './styles.module.scss'

import type { EmojiData } from 'emoji-mart/index'
import {
  RovingTabindexProvider,
  useRovingTabindex,
} from '../../contexts/RovingTabindex'

type Props = {
  stickerPackName: string
  stickerPackImages: string[]
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
}

const DisplayedStickerPack = ({
  stickerPackName,
  stickerPackImages,
  chatId,
  setShowEmojiPicker,
}: Props) => {
  const { jumpToMessage } = useMessage()
  const accountId = selectedAccountId()

  const listRef = useRef<HTMLDivElement>(null)

  const onClickSticker = (fileName: string) => {
    const stickerPath = fileName.replace('file://', '')
    BackendRemote.rpc
      .sendSticker(accountId, chatId, stickerPath)
      .then(msgId =>
        jumpToMessage({ accountId, msgId, msgChatId: chatId, highlight: false })
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
          {stickerPackImages.map((filePath, index) => (
            <StickersListItem
              key={index}
              filePath={filePath}
              onClick={() => onClickSticker(filePath)}
            />
          ))}
        </RovingTabindexProvider>
      </div>
    </div>
  )
}

function StickersListItem(props: { filePath: string; onClick: () => void }) {
  const { filePath, onClick } = props
  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)
  return (
    <button
      ref={ref}
      className={'sticker ' + rovingTabindex.className}
      onClick={onClick}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <img src={filePath} />
    </button>
  )
}

export const StickerPicker = ({
  stickers,
  chatId,
  setShowEmojiPicker,
}: {
  stickers: { [key: string]: string[] }
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
}) => {
  const tx = useTranslationFunction()

  const onOpenStickerFolder = async () => {
    const folder =
      await BackendRemote.rpc.miscGetStickerFolder(selectedAccountId())
    runtime.openPath(folder)
  }

  const stickerPackNames = Object.keys(stickers)

  return (
    <div className='sticker-picker'>
      {stickerPackNames.length > 0 ? (
        <>
          <div className='sticker-container'>
            {stickerPackNames.map(name => (
              <DisplayedStickerPack
                chatId={chatId}
                key={name}
                stickerPackName={name}
                stickerPackImages={stickers[name]}
                setShowEmojiPicker={setShowEmojiPicker}
              />
            ))}
          </div>
          <div className='sticker-actions-container'>
            <Button styling='secondary' onClick={onOpenStickerFolder}>
              {tx('open_sticker_folder')}
            </Button>
          </div>
        </>
      ) : (
        <div className='sticker-container'>
          <div className='no-stickers'>
            <p className='description'>{tx('add_stickers_instructions')}</p>
            <Button onClick={onOpenStickerFolder}>
              {tx('open_sticker_folder')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const EmojiOrStickerSelectorButton = (
  props: PropsWithChildren<{ onClick: () => void; isSelected: boolean }>
) => {
  return (
    <button
      className={classNames('selector-button', {
        selected: props.isSelected,
      })}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

export const EmojiAndStickerPicker = forwardRef<
  HTMLDivElement,
  {
    onEmojiSelect: (emoji: EmojiData) => void
    chatId: number
    setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>
  }
>((props, ref) => {
  const accountId = selectedAccountId()
  const { onEmojiSelect, chatId, setShowEmojiPicker } = props

  const [showSticker, setShowSticker] = useState(false)
  const [stickers, setStickers] = useState<{
    [key: string]: string[]
  }>({})

  useEffect(() => {
    BackendRemote.rpc
      .miscGetStickers(accountId)
      .then(stickers => setStickers(stickers))
  }, [accountId])

  return (
    <div className={'emoji-sticker-picker'} ref={ref}>
      <div className='emoji-or-sticker-header-nav'>
        <EmojiOrStickerSelectorButton
          onClick={() => setShowSticker(false)}
          isSelected={!showSticker}
        >
          Emoji
        </EmojiOrStickerSelectorButton>
        <EmojiOrStickerSelectorButton
          onClick={() => setShowSticker(true)}
          isSelected={showSticker}
        >
          Sticker
        </EmojiOrStickerSelectorButton>
      </div>
      {!showSticker && (
        <EmojiPicker
          className={styles.emojiPicker}
          full
          onSelect={onEmojiSelect}
        />
      )}
      {showSticker && (
        <StickerPicker
          chatId={chatId}
          stickers={stickers}
          setShowEmojiPicker={setShowEmojiPicker}
        />
      )}
    </div>
  )
})
