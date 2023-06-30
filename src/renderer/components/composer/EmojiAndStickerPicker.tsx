import React, {
  useState,
  useEffect,
  forwardRef,
  PropsWithChildren,
} from 'react'
import classNames from 'classnames'
import { useTranslationFunction } from '../../contexts'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '../../runtime'
import { jumpToMessage } from '../helpers/ChatMethods'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import type { EmojiData } from 'emoji-mart/index'
import { useThemeCssVar } from '../../ThemeManager'

const DisplayedStickerPack = ({
  stickerPackName,
  stickerPackImages,
  chatId,
  setShowEmojiPicker,
}: {
  stickerPackName: string
  stickerPackImages: string[]
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
}) => {
  const onClickSticker = (fileName: string) => {
    const stickerPath = fileName.replace('file://', '')
    BackendRemote.rpc
      .sendSticker(selectedAccountId(), chatId, stickerPath)
      .then(id => jumpToMessage(id, false))
    setShowEmojiPicker(false)
  }

  return (
    <div className='sticker-pack'>
      <div className='title'>{stickerPackName}</div>
      <div className='container'>
        {stickerPackImages.map((filePath, index) => (
          <button
            className='sticker'
            key={index}
            onClick={() => onClickSticker(filePath)}
          >
            <img src={filePath} />
          </button>
        ))}
      </div>
    </div>
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
    const folder = await BackendRemote.rpc.miscGetStickerFolder(
      selectedAccountId()
    )
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
            <button
              className='delta-button-round'
              onClick={onOpenStickerFolder}
            >
              {tx('open_sticker_folder')}
            </button>
          </div>
        </>
      ) : (
        <div className='sticker-container'>
          <div className='no-stickers'>
            <h2 className='title'>{tx('no_stickers_yet')}</h2>
            <p className='description'>{tx('add_stickers_instructions')}</p>
            <button
              className='delta-button-round'
              onClick={onOpenStickerFolder}
            >
              {tx('open_sticker_folder')}
            </button>
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
    <div
      className={classNames('selector-button', {
        selected: props.isSelected,
      })}
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

  let emoji_picker_category_style = useThemeCssVar(
    '--SPECIAL-emoji-picker-category-icon-style'
  )
  if (
    emoji_picker_category_style !== 'solid' &&
    emoji_picker_category_style !== 'outline'
  ) {
    emoji_picker_category_style = 'solid'
  }

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
        <div className='emoji-picker'>
          <Picker
            data={data}
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
            onEmojiSelect={onEmojiSelect}
            navPosition={'bottom'}
            previewPosition={'none'}
            searchPosition={'sticky'}
            skinTonePosition={'none'}
            autoFocus={true}
            dynamicWidth={true}
            icons={emoji_picker_category_style}
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
  )
})
