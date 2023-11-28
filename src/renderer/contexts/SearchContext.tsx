import React, { useState } from 'react'

import type { PropsWithChildren } from 'react'

type QueryChatId = number | null

type SearchContextValue = {
  queryStr: string
  queryChatId: QueryChatId
  searchChats: (queryStr: string, chatId?: QueryChatId) => void
}

const initialValues: SearchContextValue = {
  queryStr: '',
  queryChatId: null,
  searchChats: _ => {},
}

export const SearchContext =
  React.createContext<SearchContextValue>(initialValues)

export const SearchContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [queryStr, setQueryStr] = useState(initialValues.queryStr)
  const [queryChatId, setQueryChatId] = useState<QueryChatId>(
    initialValues.queryChatId
  )

  const searchChats = (queryStr: string, chatId: QueryChatId = null) => {
    setQueryStr(queryStr)
    setQueryChatId(chatId)
  }

  const value = {
    queryStr,
    queryChatId,
    searchChats,
  }

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
