import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { throttle } from '@deltachat-desktop/shared/util'

import AccountHoverInfo from './AccountHoverInfo'
import AccountItem from './AccountItem'
import Icon from '../Icon'
import Settings from '../Settings'
import useDialog from '../../hooks/dialog/useDialog'
import { BackendRemote } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { useAccountDragAndDrop } from '../../hooks/useAccountDragAndDrop'
import { useAccountNotificationStore } from '../../stores/accountNotifications'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import { ScreenContext } from '../../contexts/ScreenContext'
import useChat from '../../hooks/chat/useChat'
import { Screens } from '../../ScreenController'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import {
  RovingTabindexProvider,
  useRovingTabindex,
} from '../../contexts/RovingTabindex'
import classNames from 'classnames'
import { useRpcFetch } from '../../hooks/useFetch'
import AlertDialog from '../dialogs/AlertDialog'
import { unknownErrorToString } from '../helpers/unknownErrorToString'

type Props = {
  onAddAccount: () => Promise<number>
  onSelectAccount: (accountId: number) => Promise<void>
  openAccountDeletionScreen: (accountId: number) => Promise<void>
  selectedAccountId?: number
}

export default function AccountListSidebar({
  onAddAccount,
  onSelectAccount,
  openAccountDeletionScreen,
  selectedAccountId,
}: Props) {
  const tx = useTranslationFunction()

  const accountsListRef = useRef<HTMLUListElement>(null)
  const { openDialog } = useDialog()

  const accountsFetch = useRpcFetch(BackendRemote.rpc.getAllAccountIds, [])
  useEffect(() => {
    const throttledRefreshAccountList = throttle(accountsFetch.refresh, 200)

    BackendRemote.on('AccountsChanged', throttledRefreshAccountList)
    return () => {
      BackendRemote.off('AccountsChanged', throttledRefreshAccountList)
    }
  }, [accountsFetch.refresh])

  const [{ accounts: noficationSettings }] = useAccountNotificationStore()

  const {
    draggedAccountId,
    dropIndicator,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  } = useAccountDragAndDrop(accountsFetch)

  const { smallScreenMode } = useContext(ScreenContext)
  const { chatId } = useChat()

  const shouldBeHidden = smallScreenMode && chatId !== undefined

  const selectAccount = async (accountId: number) => {
    if (selectedAccountId === accountId) {
      ActionEmitter.emitAction(KeybindAction.ChatList_ExitSearch)
      return
    }

    await onSelectAccount(accountId)
  }

  const [syncAllAccounts, setSyncAllAccounts] = useState(true)

  useEffect(() => {
    const refreshSyncAllAccounts = async () => {
      const desktopSettings = await runtime.getDesktopSettings()
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
    }

    refreshSyncAllAccounts()

    const throttledRefreshSyncAllAccounts = throttle(
      refreshSyncAllAccounts,
      200
    )
    /// now this workaround is only used when changing background sync setting
    window.__updateAccountListSidebar = throttledRefreshSyncAllAccounts
  }, [])

  const [accountForHoverInfo, internalSetAccountForHoverInfo] =
    useState<T.Account | null>(null)

  const updateAccountForHoverInfo = (
    actingAccount: T.Account,
    select: boolean
  ) => {
    internalSetAccountForHoverInfo(oldAccount => {
      if (actingAccount === oldAccount && select === false) {
        // only deselect if it is really deselecting the current one
        return null
      }
      if (select) return actingAccount
      return null
    })
  }

  const hoverInfo = useRef<HTMLDivElement | null>(null)

  const updateHoverInfoPosition = useCallback(() => {
    if (hoverInfo.current && accountForHoverInfo) {
      const elem = document.querySelector(
        `[x-account-sidebar-account-id="${accountForHoverInfo.id}"]`
      )
      if (elem) {
        const rect = elem.getBoundingClientRect()
        hoverInfo.current.style.top = `${rect.top}px`
        hoverInfo.current.style.insetInlineStart = `${rect.width + 30}px`
      }
    }
  }, [accountForHoverInfo])

  useEffect(() => {
    updateHoverInfoPosition()
  }, [accountForHoverInfo, updateHoverInfoPosition])

  const openSettings = () => openDialog(Settings)

  if (shouldBeHidden) {
    return <div></div>
  }

  return (
    <div className={styles.accountListSidebar}>
      {runtime.getRuntimeInfo().isMac && !smallScreenMode && (
        <div
          className={styles.macOSTrafficLightBackground}
          data-tauri-drag-region
        />
      )}
      <nav
        // Perhaps just "Profiles" would be more appropriate,
        // because you can do other things with profiles in this list,
        // but we have the same on Android.
        aria-label={tx('switch_account')}
        className={styles.accountListNav}
      >
        <ul
          ref={accountsListRef}
          className={styles.accountList}
          onScroll={updateHoverInfoPosition}
          role='tablist'
          aria-orientation='vertical'
        >
          <RovingTabindexProvider wrapperElementRef={accountsListRef}>
            {accountsFetch.lingeringResult?.ok === false ? (
              <button
                type='button'
                onClick={() => {
                  if (
                    !accountsFetch.lingeringResult ||
                    accountsFetch.lingeringResult.ok
                  ) {
                    // This should not happen, TypeScript.
                    throw new Error('expected non-ok value')
                  }
                  openDialog(AlertDialog, {
                    message: tx(
                      'error_x',
                      'Failed to load account IDs:\n' +
                        unknownErrorToString(accountsFetch.lingeringResult.err)
                    ),
                  })
                }}
                aria-label={tx('error')}
                title={tx('error')}
              >
                ⚠️
              </button>
            ) : (
              accountsFetch.lingeringResult?.value.map((id, index) => (
                <li
                  key={id}
                  draggable
                  onDragStart={() => handleDragStart(id)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                  className={classNames({
                    [styles.dragging]: draggedAccountId === id,
                    [styles.dragOverTop]:
                      dropIndicator?.index === index &&
                      dropIndicator?.position === 'top' &&
                      draggedAccountId !== id,
                    [styles.dragOverBottom]:
                      dropIndicator?.index === index &&
                      dropIndicator?.position === 'bottom' &&
                      draggedAccountId !== id,
                  })}
                >
                  <AccountItem
                    accountId={id}
                    isSelected={selectedAccountId === id}
                    onSelectAccount={selectAccount}
                    openAccountDeletionScreen={openAccountDeletionScreen}
                    updateAccountForHoverInfo={updateAccountForHoverInfo}
                    syncAllAccounts={syncAllAccounts}
                    muted={noficationSettings[id]?.muted || false}
                  />
                </li>
              ))
            )}
            <li>
              <AddAccountButton onClick={onAddAccount} />
            </li>
          </RovingTabindexProvider>
        </ul>
      </nav>
      {/* The condition is the same as in https://github.com/deltachat/deltachat-desktop/blob/63af023437ff1828a27de2da37bf94ab180ec528/src/renderer/contexts/KeybindingsContext.tsx#L26 */}
      {window.__screen === Screens.Main && (
        <div className={styles.buttonsContainer}>
          {/* TODO a11y: this button shoul probably be
          inside a landmark / section.
          But which? It doesn't really belong to "Profiles". */}
          <button
            type='button'
            aria-label={tx('menu_settings')}
            className={styles.settingsButton}
            onClick={openSettings}
            data-testid='open-settings-button'
          >
            <Icon
              size={38}
              className={styles.settingsButtonIcon}
              icon={'settings'}
            />
          </button>
        </div>
      )}
      <div className={styles.accountHoverInfoContainer} ref={hoverInfo}>
        {accountForHoverInfo && (
          <AccountHoverInfo
            account={accountForHoverInfo}
            isSelected={selectedAccountId === accountForHoverInfo.id}
            muted={noficationSettings[accountForHoverInfo.id]?.muted || false}
          />
        )}
      </div>
    </div>
  )
}

function AddAccountButton(props: { onClick: () => void }) {
  const tx = useTranslationFunction()

  const ref = useRef<HTMLButtonElement>(null)
  // This relies on the existence of `RovingTabindexProvider`.
  // This is why this button is a separate component.
  const rovingTabindex = useRovingTabindex(ref)

  return (
    <button
      type='button'
      ref={ref}
      aria-label={tx('add_account')}
      className={classNames(styles.addButton, rovingTabindex.className)}
      tabIndex={rovingTabindex.tabIndex}
      data-testid='add-account-button'
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
      {...props}
    >
      +
    </button>
  )
}
