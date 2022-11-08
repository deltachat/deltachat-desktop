import React, {
  useState,
  useEffect,
  forwardRef,
  PropsWithChildren,
  useLayoutEffect,
} from 'react'
import { Picker, EmojiData } from 'emoji-mart'
import classNames from 'classnames'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { useTranslationFunction } from '../../contexts'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '../../runtime'
import { jumpToMessage } from '../helpers/ChatMethods'

export const StickerDiv = (props: {
  stickerPackName: string
  stickerPackImages: string[]
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
}) => {
  const {
    stickerPackName,
    stickerPackImages,
    chatId,
    setShowEmojiPicker,
  } = props
  const onClickSticker = (fileName: string) => {
    const stickerPath = fileName.replace('file://', '')
    BackendRemote.rpc
      .sendSticker(selectedAccountId(), chatId, stickerPath)
      .then(id => jumpToMessage(id, false))
    setShowEmojiPicker(false)
  }

  return (
    <div>
      <div className='emoji-sticker-picker__sticker-picker__inner__sticker-pack-title'>
        {stickerPackName}
      </div>
      <div className='emoji-sticker-picker__sticker-picker__inner__sticker-pack-container'>
        {stickerPackImages.map((filePath, index) => {
          return (
            <div
              className='emoji-sticker-picker__sticker-picker__inner__sticker-pack-container__sticker'
              key={index}
            >
              <img
                src={filePath}
                onClick={onClickSticker.bind(null, filePath)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const StickerPicker = (props: {
  stickers: { [key: string]: string[] }
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
}) => {
  const { stickers, chatId, setShowEmojiPicker } = props

  const onOpenStickerFolder = async () => {
    const folder = await BackendRemote.rpc.miscGetStickerFolder(
      selectedAccountId()
    )
    runtime.openPath(folder)
  }

  return (
    <div className='emoji-sticker-picker__sticker-picker'>
      <button onClick={onOpenStickerFolder}>Open Sticker Folder</button>
      <div className='emoji-sticker-picker__sticker-picker__inner'>
        {Object.keys(stickers).map(stickerPackName => {
          return (
            <StickerDiv
              chatId={chatId}
              key={stickerPackName}
              stickerPackName={stickerPackName}
              stickerPackImages={stickers[stickerPackName]}
              setShowEmojiPicker={setShowEmojiPicker}
            />
          )
        })}
      </div>
    </div>
  )
}

const EmojiOrStickerSelectorButton = (
  props: PropsWithChildren<{ onClick: () => void; isSelected: boolean }>
) => {
  return (
    <div
      className={classNames(
        'emoji-sticker-picker__emoji-or-sticker-selector__button',
        {
          'emoji-sticker-picker__emoji-or-sticker-selector__button--is-selected':
            props.isSelected,
        }
      )}
      onClick={props.onClick}
    >
      {props.children}
    </div>
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
  const tx = useTranslationFunction()

  const [showSticker, setShowSticker] = useState(false)
  const [stickers, setStickers] = useState<{
    [key: string]: string[]
  }>({})

  useEffect(() => {
    BackendRemote.rpc
      .miscGetStickers(accountId)
      .then(stickers => setStickers(stickers))
  }, [accountId])

  useLayoutEffect(() => {
    document
      .querySelector('.emoji-sticker-picker__emoji-picker > .emoji-mart-search')
      ?.querySelector('input')
      ?.focus()
    return () => {
      ActionEmitter.emitAction(KeybindAction.Composer_Focus)
    }
  }, [])

  return (
    <div
      className={classNames('emoji-sticker-picker', {
        'disable-sticker': false,
      })}
      ref={ref}
    >
      <div className='emoji-sticker-picker__emoji-or-sticker-selector'>
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
      <div className='emoji-sticker-picker__emoji-or-sticker-picker'>
        {!showSticker && (
          <div className='emoji-sticker-picker__emoji-picker'>
            <Picker
              style={{ width: '100%', height: '100%' }}
              i18n={{
                search: tx('search'),
                notfound: tx('emoji_not_found'),
                categories: {
                  search: tx('emoji_search_results'),
                  recent: tx('emoji_recent'),
                  people: tx('emoji_people'),
                  nature: tx('emoji_nature'),
                  foods: tx('emoji_foods'),
                  activity: tx('emoji_activity'),
                  places: tx('emoji_places'),
                  objects: tx('emoji_objects'),
                  symbols: tx('emoji_symbols'),
                  flags: tx('emoji_flags'),
                },
              }}
              native
              onSelect={onEmojiSelect}
              showPreview={false}
              showSkinTones={false}
              emojiTooltip={true}
            />
          </div>
        )}
        {showSticker && (
          <StickerPicker
            chatId={chatId}
            stickers={stickers}
            setShowEmojiPicker={setShowEmojiPicker}
          />
        )}
      </div>
    </div>
  )
})
