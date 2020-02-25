import React, { useState, useEffect } from 'react'
import { Picker } from 'emoji-mart'
import classNames from 'classnames'
import { callDcMethod, callDcMethodAsync } from '../../ipc'

export const useAsyncEffect = (asyncEffect, ...args) =>
  useEffect(() => {
    asyncEffect()
  }, ...args)

export const StickerDiv = props => {
  const {
    stickerPackName,
    stickerPackImages,
    chatId,
    setShowEmojiPicker,
  } = props
  const onClickSticker = fileName => {
    callDcMethod('messageList.sendSticker', [chatId, fileName])
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
                onClick={onClickSticker.bind(this, filePath)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const StickerPicker = props => {
  const { stickers, chatId, setShowEmojiPicker } = props
  return (
    <div className='emoji-sticker-picker__sticker-picker'>
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

export const EmojiOrStickerSelectorButton = props => {
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

const EmojiAndStickerPicker = React.forwardRef((props, ref) => {
  const { onEmojiSelect, emojiTooltip, chatId, setShowEmojiPicker } = props

  const [showSticker, setShowSticker] = useState(false)
  const [stickers, setStickers] = useState(null)
  const disableStickers =
    stickers === null || Object.keys(stickers).length === 0

  useAsyncEffect(async () => {
    const stickers = await callDcMethodAsync('stickers.getStickers')
    setStickers(stickers)
  }, [])

  return (
    <div
      className={classNames('emoji-sticker-picker', {
        'disable-sticker': disableStickers,
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
              native
              onSelect={onEmojiSelect}
              showPreview={false}
              showSkinTones={false}
              emojiTooltip={emojiTooltip}
            />
          </div>
        )}
        {showSticker && stickers !== null && typeof stickers === 'object' && (
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

export default EmojiAndStickerPicker
