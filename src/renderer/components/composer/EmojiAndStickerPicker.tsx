import React, {
  useState,
  useEffect,
  forwardRef,
  PropsWithChildren,
  useLayoutEffect,
} from 'react'
import classNames from 'classnames'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { useTranslationFunction } from '../../contexts'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '../../runtime'
import { jumpToMessage } from '../helpers/ChatMethods'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

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
    <div className='sticker-pack'>
      <div className='title'>{stickerPackName}</div>
      <div className='container'>
        {stickerPackImages.map((filePath, index) => {
          return (
            <div className='sticker' key={index}>
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
    <div className='sticker-picker'>
      <button onClick={onOpenStickerFolder}>Open Sticker Folder</button>
      <div className='sticker-container'>
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
