import React, { useState, useEffect, useRef } from 'react';
const styled = require('styled-components').default
const StyleVariables = require('./style-variables')
import { FixedSizeList as List } from 'react-window';

const ChatListWrapper = styled.div`
  width: 30%;
  height: calc(100vh - 50px);
  float: left;
  overflow-y: auto;
  border-right: 1px solid #b9b9b9;
  box-shadow: 0 0 4px 1px rgba(16, 22, 26, 0.1), 0 0 0 rgba(16, 22, 26, 0), 0 1px 1px rgba(16, 22, 26, 0.2);
  user-select: none;
  margin-top: 50px;

  span.module-contact-name {
    font-weight: 200;
    font-size: medium;
    color: #232323;
  }

  .module-conversation-list-item:hover {
    background-color: ${StyleVariables.colors.deltaHover}
  }

  .module-conversation-list-item--is-selected {
    background-color: ${StyleVariables.colors.deltaSelected};
    color: ${StyleVariables.colors.deltaPrimaryFg};
    
    span.module-contact-name {
      color: ${StyleVariables.colors.deltaPrimaryFg};
    }

    .module-conversation-list-item__is-group {
      filter: unset; 
    }

    &:hover {
      background-color: ${StyleVariables.colors.deltaSelected};
    }
  }

  .module-conversation-list-item__header__name {
    width: 90%;
  }

  .module-conversation-list-item__message__status-icon {
    margin-left: calc(100% - 90% - 12px);
  }

}
`
const Row = ({ index, style }) => (
  <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
    Row {index}
  </div>
);

export default function ChatList () {
  const [chatIds, setChatIds] = useState(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const listRef = useRef(null)

  useEffect(() => {
    setInterval(() => {
      console.log(listRef)
      if(listRef.current !== null) {
        let currentScrollOffset = listRef.current._outerRef.scrollHeight  
        console.log(currentScrollOffset)
        //setScrollOffset(scrollOffset + 4 * 150)
      }
      setChatIds([...chatIds === null ? [] : chatIds, 1,2,3,4])
    }, 1000)
  }, [])
  
  return (
    <ChatListWrapper>
      {chatIds === null ?
        <p>Loading chats...</p>
      :
        <List
          ref={listRef}
          className="List"
          height={150}
          itemCount={chatIds.length}
          itemSize={35}
          width={300}
        >
          {Row}
        </List>
      }
    </ChatListWrapper>
  )
}

