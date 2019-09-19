import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { callDcMethod, callDcMethodAsync, ipcBackend } from '../../ipc'
import { Card, Classes } from '@blueprintjs/core'
import chatListStore from '../../stores/chatList'
import { DeltaDialogBase, DeltaDialogBody, DeltaDialogHeader } from '../helpers/DeltaDialog'
import ChatListItem from '../ChatListItem'
import { CreateChatSearchInput } from './CreateChat-Styles'
import debounce from 'debounce'
import classNames from 'classnames'

const debouncedGetChatListIds = debounce((listFlags, queryStr, queryContactId, cb) => {
  callDcMethod('getChatListIds', [listFlags, queryStr, queryContactId], cb)
}, 200)

export function useChatListIds(_listFlags, _queryStr, _queryContactId) {
  if(!_queryStr) _queryStr = ''

  const [listFlags, setListFlags] = useState(_listFlags)
  const [queryStr, setQueryStr] = useState(_queryStr)
  const [queryContactId, setQueryContactId] = useState(_queryContactId)
  const [chatListIds, setChatListIds] = useState([])

  const getAndSetChatListIds = immediatly => {
    if (immediatly === true) {
      callDcMethod('getChatListIds', [listFlags, queryStr, queryContactId], setChatListIds)
      return
    }
    debouncedGetChatListIds(listFlags, queryStr, queryContactId, setChatListIds)
  }

  const onChatListUpdated = () => getAndSetChatListIds()

  useEffect(() => {
    getAndSetChatListIds(true)
    ipcBackend.on('DD_EVENT_CHATLIST_UPDATED', onChatListUpdated)
    return () => ipcBackend.removeListener('DD_EVENT_CHATLIST_UPDATED', onChatListUpdated)
  }, [])

  useEffect(() => {
    getAndSetChatListIds()
  }, [listFlags, queryStr, queryContactId])

  return {chatListIds, listFlags, setListFlags, queryStr, setQueryStr, queryContactId, setQueryContactId}
}

export const PlaceholderChatListItem = React.memo((props) => {
  return (
    <div style={{height: '64px'}} />
  )
})

const in_fetch = []
export const LazyChatList = React.memo((props) => {
  const { chatListIds, onChatClick } = props
  const [ chatItems, setChatItems ] = useState({})
  const scrollRef = useRef(null)
  const fetching = useRef([])


  const fetchChatsInView = (_scrollRef) => {
    if (!scrollRef.current) {
      console.log('scrollRef is undefined')
      return
    }
    if (chatListIds.length === 0) return
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current
    const itemHeight = scrollHeight / chatListIds.length
    const indexStart = Math.floor(scrollTop / itemHeight)
    const indexEnd = Math.floor(1 + indexStart + clientHeight / itemHeight)
    for(let i = indexStart; i <= indexEnd; i++) {
      let chatId = chatListIds[i]
      if (!chatId) break
      if (typeof chatItems[chatId] !== 'undefined' || fetching.current.indexOf(chatId) !== -1) continue
      fetching.current.push(chatId)
      callDcMethod('getSmallChatById', chatId, chat => {
        setChatItems(chatItems => {return {...chatItems, [chatId]: chat}})
        console.log(fetching)
        let index = fetching.current.indexOf(chatId)
        fetching.current.splice(index, index)
      })
    }
  }

  useLayoutEffect(() => {
    if(!scrollRef.current) return
    fetchChatsInView(scrollRef)
  }, [chatListIds])

  return (  
    <div ref={scrollRef} className={classNames(Classes.DIALOG_BODY, '.bp3-dialog-body-no-footer')} onScroll={fetchChatsInView}>
      <Card>
        {chatListIds.map((chatId, chatListIndex) => {
          let chatListItem = chatItems[chatId]
           if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem key={chatId} />
           return (
             <ChatListItem 
               key={chatId}
               onClick={onChatClick.bind(null, chatId)}
               chatListItem={chatListItem}
             /> 
           )
        })}
      </Card>
    </div>
  )
})

export default function ForwardMessage(props) {
  const tx = window.translate
  const { forwardMessage, onClose } = props
  const { chatListIds, queryStr, setQueryStr} = useChatListIds()

  const onChatClick = chatid => {
    callDcMethod('forwardMessage', [props.forwardMessage.msg.id, chatid])
    props.onClose()
  }
  const onSearchChange = e => setQueryStr(e.target.value)


  var isOpen = !!forwardMessage
  return (
    <DeltaDialogBase
      isOpen={isOpen}
      title={tx('menu_forward')}
      onClose={onClose}
      style={{ width: '400px', height: 'calc(100% - 60px)', margin: '0' }}
    >
      <DeltaDialogHeader onClose={onClose}>
        <CreateChatSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('contacts_enter_name_or_email')} autoFocus />
      </DeltaDialogHeader>
      <LazyChatList chatListIds={chatListIds} onChatClick={onChatClick} />
    </DeltaDialogBase>
  )
}
