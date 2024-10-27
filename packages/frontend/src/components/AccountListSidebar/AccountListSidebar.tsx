import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { debounce } from 'debounce'

import AccountHoverInfo from './AccountHoverInfo'
import AccountItem from './AccountItem'
import Icon from '../Icon'
import Settings from '../Settings'
import useDialog from '../../hooks/dialog/useDialog'
import { BackendRemote } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { useAccountNotificationStore } from '../../stores/accountNotifications'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import { ScreenContext } from '../../contexts/ScreenContext'
import useChat from '../../hooks/chat/useChat'
import { Screens } from '../../ScreenController'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import useTranslationFunction from '../../hooks/useTranslationFunction'

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

  const { openDialog } = useDialog()
  const [accounts, setAccounts] = useState<number[]>([])
  const [{ accounts: noficationSettings }] = useAccountNotificationStore()

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

  const refresh = useMemo(
    () => async () => {
      const accounts = await BackendRemote.rpc.getAllAccountIds()
      setAccounts(accounts)
      const desktopSettings = await runtime.getDesktopSettings()
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
    },
    []
  )

  useEffect(() => {
    refresh()
  }, [selectedAccountId, refresh])

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
        hoverInfo.current.style.left = `${rect.right + 15}px`
      }
    }
  }, [accountForHoverInfo])

  useEffect(() => {
    updateHoverInfoPosition()
  }, [accountForHoverInfo, updateHoverInfoPosition])

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      refresh()
    }, 200)

    /// now this workaround is only used when changing background sync setting
    window.__updateAccountListSidebar = debouncedUpdate
    BackendRemote.on('AccountsChanged', debouncedUpdate)
    return () => {
      BackendRemote.off('AccountsChanged', debouncedUpdate)
    }
  }, [refresh])

  const openSettings = () => openDialog(Settings)

  if (shouldBeHidden) {
    return <div></div>
  }

  return (
    <div className={styles.accountListSidebar}>
      {runtime.getRuntimeInfo().isMac && !smallScreenMode && (
        <div className={styles.macOSTrafficLightBackground} />
      )}
      <div className={styles.accountList} onScroll={updateHoverInfoPosition}>
        {accounts.map(id => (
          <AccountItem
            key={id}
            accountId={id}
            isSelected={selectedAccountId === id}
            onSelectAccount={selectAccount}
            openAccountDeletionScreen={openAccountDeletionScreen}
            updateAccountForHoverInfo={updateAccountForHoverInfo}
            syncAllAccounts={syncAllAccounts}
            muted={noficationSettings[id]?.muted || false}
          />
        ))}
        <button
          aria-label={tx('add_account')}
          className={styles.addButton}
          onClick={onAddAccount}
        >
          +
        </button>
      </div>
      {/* The condition is the same as in https://github.com/deltachat/deltachat-desktop/blob/63af023437ff1828a27de2da37bf94ab180ec528/src/renderer/contexts/KeybindingsContext.tsx#L26 */}
      {window.__screen === Screens.Main && (
        <div className={styles.buttonsContainer}>
          <button
            aria-label={tx('menu_settings')}
            className={styles.settingsButton}
            onClick={openSettings}
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
