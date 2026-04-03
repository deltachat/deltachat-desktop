import React, {
  useState,
  useEffect,
  forwardRef,
  PropsWithChildren,
  useRef,
  useMemo,
  useCallback,
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

/** Sticker aliases map: sticker file path -> list of emoji/text aliases */
export type StickerAliases = { [stickerPath: string]: string[] }

/**
 * Extracts emoji aliases from sticker file paths.
 *
 * Filename convention: `{index}.{text_name}+{emoji}.ext`
 * e.g. `0.smiling_face_with_heart-eyes+😍.webp` → aliases: ["😍", "smiling_face_with_heart-eyes"]
 */
export function parseStickerAliasesFromFilename(filePath: string): string[] {
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '')

  // Pattern: {index}.{text_name}+{emoji}
  const plusIndex = nameWithoutExt.lastIndexOf('+')
  if (plusIndex === -1) return []

  const emoji = nameWithoutExt.substring(plusIndex + 1)
  // Extract the text name part (between first dot and the +)
  const dotIndex = nameWithoutExt.indexOf('.')
  const textName =
    dotIndex !== -1 && dotIndex < plusIndex
      ? nameWithoutExt.substring(dotIndex + 1, plusIndex)
      : ''

  const result: string[] = []
  if (emoji) result.push(emoji)
  if (textName) result.push(textName.replace(/[-_]/g, ' '))
  return result
}

export function loadStickerAliases(
  stickers: { [key: string]: string[] }
): StickerAliases {
  const aliases: StickerAliases = {}

  for (const [_packName, paths] of Object.entries(stickers)) {
    if (paths.length === 0) continue

    for (const stickerPath of paths) {
      const parsed = parseStickerAliasesFromFilename(stickerPath)
      if (parsed.length > 0) {
        aliases[stickerPath] = parsed
      }
    }
  }

  return aliases
}

/** Show all stickers for a single pack, used when a pack is selected */
const DisplayedStickerPack = ({
  stickerPackName,
  stickerPackImages,
  chatId,
  setShowEmojiPicker,
  aliases,
}: {
  stickerPackName: string
  stickerPackImages: string[]
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
  aliases: StickerAliases
}) => {
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
        <RovingTabindexProvider
          wrapperElementRef={listRef}
          direction='horizontal'
        >
          {stickerPackImages.map(filePath => (
            <StickersListItem
              key={filePath}
              filePath={filePath}
              onClick={() => onClickSticker(filePath)}
              aliases={aliases[filePath]}
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
  aliases?: string[]
}) {
  const { filePath, onClick, aliases } = props
  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)
  const title = aliases ? aliases.join(' ') : undefined
  return (
    <button
      type='button'
      ref={ref}
      className={'sticker ' + rovingTabindex.className}
      onClick={onClick}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
      title={title}
    >
      <img src={runtime.transformStickerURL(filePath)} />
    </button>
  )
}

/** Bottom navigation bar showing pack thumbnails for quick switching */
function StickerPackNav({
  stickers,
  selectedPack,
  onSelectPack,
  onOpenStickerFolder,
}: {
  stickers: { [key: string]: string[] }
  selectedPack: string | null
  onSelectPack: (packName: string | null) => void
  onOpenStickerFolder: () => void
}) {
  const tx = useTranslationFunction()
  const packNames = Object.keys(stickers)
  const navRef = useRef<HTMLDivElement>(null)

  return (
    <div className='sticker-pack-nav' ref={navRef}>
      <div className='sticker-pack-nav-items'>
        <RovingTabindexProvider
          wrapperElementRef={navRef}
          direction='horizontal'
        >
          <StickerPackNavItem
            isSelected={selectedPack === null}
            onClick={() => onSelectPack(null)}
            label={tx('all')}
          />
          {packNames.map(name => {
            const firstSticker = stickers[name]?.[0]
            return (
              <StickerPackNavItem
                key={name}
                isSelected={selectedPack === name}
                onClick={() => onSelectPack(name)}
                thumbnailSrc={
                  firstSticker
                    ? runtime.transformStickerURL(firstSticker)
                    : undefined
                }
                label={name}
              />
            )
          })}
        </RovingTabindexProvider>
      </div>
      <button
        type='button'
        className='sticker-folder-button'
        onClick={onOpenStickerFolder}
        title={tx('open_sticker_folder')}
      >
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
          <path d='M2 4a2 2 0 0 1 2-2h3.17a2 2 0 0 1 1.41.59l1.42 1.41h6a2 2 0 0 1 2 2v2h-2V6H9.83l-1.42-1.41-.29-.3-.29.3L6.41 6H4v10h7v2H4a2 2 0 0 1-2-2V4zm15 6v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2z' />
        </svg>
      </button>
    </div>
  )
}

function StickerPackNavItem(props: {
  isSelected: boolean
  onClick: () => void
  thumbnailSrc?: string
  label: string
}) {
  const { isSelected, onClick, thumbnailSrc, label } = props
  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)

  return (
    <button
      type='button'
      ref={ref}
      className={classNames('sticker-pack-nav-item', {
        selected: isSelected,
      })}
      onClick={onClick}
      title={label}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      {thumbnailSrc ? (
        <img src={thumbnailSrc} alt={label} />
      ) : (
        <span className='all-packs-icon'>⊞</span>
      )}
    </button>
  )
}

/** Search bar for filtering stickers by alias or pack name */
function StickerSearchBar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (query: string) => void
}) {
  const tx = useTranslationFunction()

  return (
    <div className='sticker-search-bar'>
      <span className='sticker-search-icon'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 18 18'
        >
          <path d='M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z' />
        </svg>
      </span>
      <input
        type='search'
        className='sticker-search-input'
        placeholder={tx('search_sticker_placeholder_desktop')}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        autoFocus={false}
      />
    </div>
  )
}

export const StickerPicker = ({
  role,
  id,
  labelledBy,
  stickers,
  chatId,
  setShowEmojiPicker,
}: {
  role: 'tabpanel' | undefined
  id: string
  labelledBy: string
  stickers: { [key: string]: string[] }
  chatId: number
  setShowEmojiPicker: (enabled: boolean) => void
}) => {
  const tx = useTranslationFunction()
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [aliases, setAliases] = useState<StickerAliases>({})

  useEffect(() => {
    setAliases(loadStickerAliases(stickers))
  }, [stickers])

  const onOpenStickerFolder = async () => {
    const folder =
      await BackendRemote.rpc.miscGetStickerFolder(selectedAccountId())
    runtime.openPath(folder)
  }

  const stickerPackNames = Object.keys(stickers)

  // Filter stickers based on search query and selected pack
  const filteredStickers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query && selectedPack === null) {
      return stickers
    }

    const result: { [key: string]: string[] } = {}

    for (const [packName, paths] of Object.entries(stickers)) {
      if (selectedPack !== null && packName !== selectedPack) {
        continue
      }

      if (!query) {
        result[packName] = paths
        continue
      }

      const filtered = paths.filter(filePath => {
        // Match against pack name
        if (packName.toLowerCase().includes(query)) return true
        // Match against filename
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
        if (fileName.toLowerCase().includes(query)) return true
        // Match against aliases
        const stickerAliases = aliases[filePath]
        if (stickerAliases) {
          return stickerAliases.some(alias =>
            alias.toLowerCase().includes(query)
          )
        }
        return false
      })

      if (filtered.length > 0) {
        result[packName] = filtered
      }
    }

    return result
  }, [stickers, selectedPack, searchQuery, aliases])

  const filteredPackNames = Object.keys(filteredStickers)

  const handleSelectPack = useCallback((packName: string | null) => {
    setSelectedPack(packName)
    setSearchQuery('')
  }, [])

  return (
    <div
      role={role}
      id={id}
      aria-labelledby={labelledBy}
      className='sticker-picker'
    >
      {stickerPackNames.length > 0 ? (
        <>
          <StickerSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className='sticker-container'>
            {filteredPackNames.length > 0 ? (
              filteredPackNames.map(name => (
                <DisplayedStickerPack
                  chatId={chatId}
                  key={name}
                  stickerPackName={name}
                  stickerPackImages={filteredStickers[name]}
                  setShowEmojiPicker={setShowEmojiPicker}
                  aliases={aliases}
                />
              ))
            ) : (
              <div className='no-stickers'>
                <p className='description'>
                  {tx('emoji_not_found')}
                </p>
              </div>
            )}
          </div>
          <StickerPackNav
            stickers={stickers}
            selectedPack={selectedPack}
            onSelectPack={handleSelectPack}
            onOpenStickerFolder={onOpenStickerFolder}
          />
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
    onEmojiSelect: (emoji: EmojiData) => void
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

  useEffect(() => {
    if (hideStickerPicker) {
      return
    }
    BackendRemote.rpc
      .miscGetStickers(accountId)
      .then(stickers => setStickers(stickers))
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
        />
      )}
    </div>
  )
})
