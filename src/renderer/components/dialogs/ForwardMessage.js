import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { callDcMethod } from '../../ipc'
import { Card, Classes } from '@blueprintjs/core'
import chatListStore from '../../stores/chatList'
import { DeltaDialogBase, DeltaDialogBody, DeltaDialogHeader } from '../helpers/DeltaDialog'
import ChatListItem from '../ChatListItem'
import { CreateChatSearchInput } from './CreateChat-Styles'
import { ipcBackend } from '../../ipc'
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

export const LazyChatListItem = (props) => {
  const { chatId, inView } = props
  const onClick = () => {
    const { onClick } = props
    if (typeof onClick !== 'function') return
    onClick(chatId)
  }

  const [chatListItem, setChatListItem] = useState(false)
  useEffect(() => {
    chatListItem === false && inView === true && callDcMethod('getSmallChatById', chatId, setChatListItem)
  }, [inView])
  //console.log('render', chatId, inView)
  return (
    <>
    { chatListItem === false && <PlaceholderChatListItem chatId={chatId} /> }
    { chatListItem !== false && <ChatListItem
      key={chatId}
      onClick={onClick.bind(null, chatListItem.id)}
      chatListItem={chatListItem}
    /> }
    </>
  )
}

export const PlaceholderChatListItem = (props) => {
  return (
    <div style={{height: '64px'}} />
  )
}

export const LazyChatList = (props) => {
  const { chatListIds, onChatClick } = props
  const [ chatListIndexInView, setChatListIndexInView ] = useState(false)         
  const scrollRef = useRef(null)

  const calculateIndexesInView = (_scrollRef) => {
    if (!scrollRef.current) {
      console.log('scrollRef is undefined')
      return
    }
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current
    console.log(scrollHeight, scrollTop, clientHeight)
    const itemHeight = scrollHeight / chatListIds.length
    const indexStart = Math.floor(scrollTop / itemHeight)
    const indexEnd = Math.floor(1 + indexStart + clientHeight / itemHeight)
    console.log(indexStart, indexEnd)
    setChatListIndexInView([indexStart, indexEnd + 20])
  }

  const onScroll = () => calculateIndexesInView()

  const isInView = (chatListIndex) => {
    if(chatListIndexInView === false) return false
    
    const [ indexStart, indexEnd ] = chatListIndexInView
    return chatListIndex >= indexStart && chatListIndex <= indexEnd 
  }

  useLayoutEffect(() => {
    if(!scrollRef.current) return
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current
    console.log(scrollHeight, scrollTop, clientHeight)
    calculateIndexesInView(scrollRef)
  }, [chatListIds])

  return (  
    <div ref={scrollRef} className={classNames(Classes.DIALOG_BODY, '.bp3-dialog-body-no-footer')} onScroll={onScroll}>
      <Card>
        {chatListIds.map((chatListId, chatListIndex) => {
          return <LazyChatListItem key={chatListId} chatId={chatListId} inView={isInView(chatListIndex)} onClick={onChatClick}/>
        })}
      </Card>
    </div>
  )
}

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
  console.log('xxx', chatListIds)
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
