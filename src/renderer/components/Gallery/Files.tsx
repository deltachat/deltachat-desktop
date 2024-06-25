import React, { ChangeEvent } from 'react'
import { FixedSizeGrid, FixedSizeList } from 'react-window'
import { FileAttachmentRow } from '../attachment/mediaAttachment'
import useTranslationFunction from '../../hooks/useTranslationFunction'

interface FileTableProps {
  width: number
  height: number
  mediaMessageIds: number[]
  mediaLoadResult: Reacord<number, Type.MessageLoadResult>
  queryText: string
}

export function FileTable({
  width,
  height,
  mediaMessageIds,
  mediaLoadResult,
  queryText,
}: FileTableProps) {
  return (
    <FixedSizeList
      width={width}
      height={height}
      itemSize={60}
      itemCount={mediaMessageIds.length}
      overscanCount={10}
      itemData={mediaMessageIds}
    >
      {({ index, style, data }) => {
        const msgId = data[index]
        const message = mediaLoadResult[msgId]
        if (!message) {
          return null
        }
        return (
          <div style={style} className='item' key={msgId}>
            <FileAttachmentRow
              messageId={msgId}
              loadResult={message}
              queryText={queryText}
            />
          </div>
        )
      }}
    </FixedSizeList>
  )
}

export function FileSearch({
  onChange,
}: {
  onChange: (evt: ChangeEvent<HTMLInputElement>) => void
}) {
  const tx = useTranslationFunction()
  return (
    <>
      <div style={{ flexGrow: 1 }}></div>
      <div className='searchbar'>
        <input
          type='search'
          placeholder={tx('search_files')}
          onChange={onChange}
        />
      </div>
    </>
  )
}

export function FilesNoResult({ queryText }: { queryText: string }) {
  const tx = useTranslationFunction()
  return (
    <div className='empty-screen'>
      <p className='no-media-message'>
        {tx('search_no_result_for_x', queryText)}
      </p>
    </div>
  )
}
