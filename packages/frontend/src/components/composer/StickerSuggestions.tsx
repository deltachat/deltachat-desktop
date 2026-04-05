import React, { useEffect, useMemo, useRef, useState } from 'react'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import useMessage from '../../hooks/chat/useMessage'
import {
  loadStickerAliases,
  StickerAliases,
} from './EmojiAndStickerPicker'

/**
 * Detects a `:query` pattern at the end of the input text
 * (i.e. a colon followed by 1+ non-whitespace chars with no closing colon).
 * Returns the query string after the colon, or null if no match.
 */
export function detectStickerQuery(text: string): string | null {
  // Match `:` preceded by start-of-string or whitespace, then 1+ non-space chars at end
  const match = text.match(/(?:^|\s):(\S+)$/)
  return match ? match[1] : null
}

type StickerSuggestionsProps = {
  query: string
  chatId: number
  onStickerSent: () => void
}

export function StickerSuggestions({
  query,
  chatId,
  onStickerSent,
}: StickerSuggestionsProps) {
  const accountId = selectedAccountId()
  const { jumpToMessage } = useMessage()

  const [stickers, setStickers] = useState<{ [key: string]: string[] }>({})
  const [aliases, setAliases] = useState<StickerAliases>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    BackendRemote.rpc.miscGetStickers(accountId).then(result => {
      setStickers(result)
      setAliases(loadStickerAliases(result))
    })
  }, [accountId])

  const matchingStickers = useMemo(() => {
    const q = query.toLowerCase()
    const results: { path: string; packName: string }[] = []

    for (const [packName, paths] of Object.entries(stickers)) {
      for (const filePath of paths) {
        // Match against pack name
        if (packName.toLowerCase().includes(q)) {
          results.push({ path: filePath, packName })
          continue
        }
        // Match against filename
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
        if (fileName.toLowerCase().includes(q)) {
          results.push({ path: filePath, packName })
          continue
        }
        // Match against aliases
        const stickerAliases = aliases[filePath]
        if (stickerAliases) {
          if (stickerAliases.some(alias => alias.toLowerCase().includes(q))) {
            results.push({ path: filePath, packName })
          }
        }
      }
    }

    return results.slice(0, 20)
  }, [stickers, aliases, query])

  if (matchingStickers.length === 0) {
    return null
  }

  const onClickSticker = (filePath: string) => {
    const stickerPath = filePath.replace('file://', '')
    BackendRemote.rpc.sendSticker(accountId, chatId, stickerPath).then(msgId =>
      jumpToMessage({
        accountId,
        msgId,
        msgChatId: chatId,
        highlight: false,
        focus: false,
      })
    )
    onStickerSent()
  }

  return (
    <div className='sticker-suggestions' ref={containerRef}>
      <div className='sticker-suggestions-list'>
        {matchingStickers.map(({ path }) => (
          <button
            key={path}
            type='button'
            className='sticker-suggestion-item'
            onClick={() => onClickSticker(path)}
            title={aliases[path]?.join(' ') || undefined}
          >
            <img src={runtime.transformStickerURL(path)} alt='' />
          </button>
        ))}
      </div>
    </div>
  )
}
