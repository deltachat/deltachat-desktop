import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useRef, useState } from 'react'

import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { getConfiguredAccounts } from '../../../backend/account'
import { ChatListItemRowChat } from '../../chat/ChatListItemRow'
import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../../chat/ChatList'
import { useChatList } from '../../chat/ChatListHelpers'
import { useThemeCssVar } from '../../../ThemeManager'
import { useRpcFetch } from '../../../hooks/useFetch'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { Avatar } from '../../Avatar'
import SelectAccountDialog from '../SelectAccountDialog'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'

type Props = {
  onClose: DialogProps['onClose']
  headerTitle: string
  onChatClick: (chatId: number, accountId: number) => void
  listFlags: number
  footer?: React.ReactElement
  /** Whether to show the account switch button (when multiple accounts exist) */
  enableAccountSwitch?: boolean
}

export default function SelectChat(props: Props) {
  const tx = useTranslationFunction()
  const currentAccountId = selectedAccountId()
  const [targetAccountId, setTargetAccountId] = useState(currentAccountId)
  const { openDialog } = useDialog()

  const accountId = props.enableAccountSwitch
    ? targetAccountId
    : currentAccountId

  const configuredAccountsFetch = useRpcFetch(getConfiguredAccounts, [])
  const hasMultipleAccounts = props.enableAccountSwitch
    ? configuredAccountsFetch.result?.ok
      ? configuredAccountsFetch.result.value.length > 1
      : false
    : false

  const accountFetch = useRpcFetch(BackendRemote.rpc.getAccountInfo, [
    accountId,
  ])
  const accountInfo = accountFetch.lingeringResult?.ok
    ? accountFetch.lingeringResult.value
    : null

  const onSwitchAccount = () => {
    openDialog(SelectAccountDialog, {
      onSelect: (newAccountId: number) => {
        setTargetAccountId(newAccountId)
      },
    })
  }

  const accountSwitch =
    hasMultipleAccounts && accountInfo?.kind === 'Configured' ? (
      <div className={styles.switchAccountContainer}>
        <button
          type='button'
          className={styles.switchAccountButton}
          data-testid='switch-account-button'
          onClick={onSwitchAccount}
        >
          <span className={styles.switchAccountText}>
            {tx('switch_account')}
          </span>
          <Avatar
            displayName={accountInfo.displayName || ''}
            avatarPath={accountInfo.profileImage || undefined}
            color={accountInfo.color || undefined}
            small
          />
        </button>
      </div>
    ) : undefined

  const [queryStr, setQueryStr] = useState('')
  const { chatListIds } = useChatList(
    props.listFlags,
    queryStr,
    undefined,
    accountId
  )
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    accountId
  )

  const chatListRef = useRef<HTMLDivElement>(null)

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const noResults = chatListIds.length === 0 && queryStr !== ''

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  return (
    <Dialog className={styles.selectChatDialog} onClose={props.onClose} fixed>
      <DialogHeader
        onClose={props.onClose}
        title={props.headerTitle}
        className={styles.header}
      />
      <DialogBody className={styles.selectChatDialogBody}>
        <div
          className={`${styles.searchRow} ${
            accountSwitch ? styles.withAccountSwitch : ''
          }`}
        >
          <div className='select-chat-account-input'>
            <input
              className='search-input'
              data-no-drag-region
              onChange={onSearchChange}
              value={queryStr}
              placeholder={tx('search')}
              autoFocus
              spellCheck={false}
            />
          </div>
          {accountSwitch}
        </div>
        <div className='select-chat-list-chat-list' ref={chatListRef}>
          <RovingTabindexProvider wrapperElementRef={chatListRef}>
            {noResults && queryStr && (
              <PseudoListItemNoSearchResults queryStr={queryStr} />
            )}
            <div style={{ height: noResults ? '0px' : '100%' }}>
              <AutoSizer disableWidth>
                {({ height }) => (
                  <ChatListPart
                    olElementAttrs={{
                      'aria-label': tx('pref_chats'),
                    }}
                    isRowLoaded={isChatLoaded}
                    loadMoreRows={loadChats}
                    rowCount={chatListIds.length}
                    width={'100%'}
                    height={height}
                    itemKey={index => 'key' + chatListIds[index]}
                    itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                    itemData={{
                      chatCache,
                      chatListIds,
                      onChatClick: (chatId: number) =>
                        props.onChatClick(chatId, accountId),

                      activeChatId: null,
                      activeContextMenuChatIds: [],
                      openContextMenu: async () => {},
                    }}
                  >
                    {ChatListItemRowChat}
                  </ChatListPart>
                )}
              </AutoSizer>
            </div>
          </RovingTabindexProvider>
        </div>
      </DialogBody>
      {props.footer}
    </Dialog>
  )
}
