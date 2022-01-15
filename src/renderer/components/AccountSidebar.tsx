import classNames from "classnames";
import React, {useCallback, useRef} from "react";
import { DeltaChatAccount, FullChat } from "../../shared/shared-types";
import {DeltaBackend} from "../delta-remote";
import ScreenController, { Screens } from "../ScreenController";
import { Avatar } from "./Avatar";
import {unselectChat} from "./helpers/ChatMethods";

export default function AccountSidebar ({
    selectedChat,
    selectAccount,
    selectedAccountId,
    logins,
  }: {
    selectedChat: FullChat | null,
    selectAccount: typeof ScreenController.prototype.selectAccount,
    selectedAccountId: number | undefined,
    logins: DeltaChatAccount[] | null
  }) {
    const accountSidebarRef = useRef<HTMLDivElement>(null)
    const toggleHideScrollbar = useCallback((show: boolean) => {
      if (accountSidebarRef.current === null) return

      show === true ?
        accountSidebarRef.current.classList.remove('hideScrollbarThumb') :
        accountSidebarRef.current.classList.add('hideScrollbarThumb')

    }, [accountSidebarRef])

    const switchAccount = useCallback(async (accountId: number) => {
      if (selectedChat) {
        unselectChat()
      }
      await DeltaBackend.call('login.logout')
      selectAccount(accountId)
    }, [selectedChat, selectAccount])
    return (
        <div className="account-sidebar hideScrollbarThumb" ref={accountSidebarRef} onMouseEnter={() => { toggleHideScrollbar(true)} } onMouseLeave={() => toggleHideScrollbar(false)}>
                {logins !== null && logins.map(account => {
                    if (account.type === 'unconfigured') return null
                    return (
                            <div className={classNames("account", { selected: account.id === selectedAccountId})} onClick={() => switchAccount(account.id)}>
                                <Avatar
                                    displayName={account.display_name === null ? '' : account.display_name}
                                    avatarPath={account.profile_image === null ? undefined : account.profile_image}
                                    color={account.color}
                                />
                            </div>
                    )
                })}
            <div className="account" onClick={() => {window.__changeScreen(Screens.Login)}}>
                <Avatar
                    avatarPath={undefined}
                    color={'#505050'}
                    displayName={"+"}
                />
            </div>
        </div>
    )
}
