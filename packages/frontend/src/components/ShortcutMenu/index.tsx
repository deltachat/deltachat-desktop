import React from 'react'
import classNames from 'classnames'

import { showReactionsUi, useReactionsBar } from '../ReactionsBar'
import Icon from '../Icon'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useMessage from '../../hooks/chat/useMessage'
import { selectedAccountId } from '../../ScreenController'

type OnButtonClick = React.MouseEvent<HTMLButtonElement, MouseEvent>

type Props = {
  chat: Parameters<typeof showReactionsUi>[1]
  direction: 'incoming' | 'outgoing'
  message: T.Message
  showContextMenu: (event: OnButtonClick) => void
  tabindexForInteractiveContents: -1 | 0
}

export default function ShortcutMenu(props: Props) {
  const tx = useTranslationFunction()
  const { jumpToMessage } = useMessage()
  const onClick = () => {
    if (props.message.originalMsgId !== null) {
      jumpToMessage({
        accountId: selectedAccountId(),
        msgId: props.message.originalMsgId,
        focus: true,
      })
    }
  }
  return (
    <div
      className={classNames(styles.shortcutMenu, {
        [styles.incoming]: props.direction === 'incoming',
        [styles.outgoing]: props.direction === 'outgoing',
      })}
    >
      {showReactionsUi(props.message, props.chat) && (
        <ReactButton
          messageId={props.message.id}
          reactions={props.message.reactions}
          tabIndex={props.tabindexForInteractiveContents}
        />
      )}
      <ContextMenuButton
        onClick={props.showContextMenu}
        tabIndex={props.tabindexForInteractiveContents}
      />
      {props.message.originalMsgId !== null && (
        <button
          type='button'
          className={classNames(styles.originalMessageButton)}
          aria-label={tx('show_in_chat')}
          onClick={onClick}
          title={tx('show_in_chat')}
        >
          <div className={classNames(styles.originalMessageIcon)} />
        </button>
      )}
    </div>
  )
}

function ReactButton(props: {
  messageId: number
  reactions: T.Message['reactions']
  tabIndex: -1 | 0
}) {
  const tx = useTranslationFunction()

  const { showReactionsBar } = useReactionsBar()

  const onClick = (event: OnButtonClick) => {
    // We don't want `OutsideClickHelper` to catch this event, causing
    // the reaction bar to directly hide again when switching to other
    // messages by clicking the "react" button
    event.stopPropagation()

    // Show reaction bar aligned centered with the "react" button
    const { x, y } = event.currentTarget.getBoundingClientRect()

    showReactionsBar({
      messageId: props.messageId,
      reactions: props.reactions,
      x,
      y,
    })
  }

  return (
    <button
      type='button'
      aria-label={tx('react')}
      className={styles.shortcutMenuButton}
      onClick={onClick}
      tabIndex={props.tabIndex}
    >
      <Icon className={styles.shortcutMenuIcon} icon='reaction' />
    </button>
  )
}

function ContextMenuButton(props: {
  onClick: (event: OnButtonClick) => void
  tabIndex: -1 | 0
}) {
  const tx = useTranslationFunction()

  return (
    <button
      type='button'
      aria-label={tx('a11y_message_context_menu_btn_label')}
      className={styles.shortcutMenuButton}
      onClick={props.onClick}
      tabIndex={props.tabIndex}
    >
      <Icon className={styles.shortcutMenuIcon} icon='more' />
    </button>
  )
}
