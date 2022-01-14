import React, {useCallback} from "react";
import { DeltaChatAccount, FullChat } from "../../shared/shared-types";
import {DeltaBackend} from "../delta-remote";
import ScreenController, { Screens } from "../ScreenController";
import { Avatar } from "./Avatar";
import {unselectChat} from "./helpers/ChatMethods";

export default function AccountSidebar ({
    selectedChat,
    selectAccount,
    logins,
  }: {
    selectedChat: FullChat | null,
    selectAccount: typeof ScreenController.prototype.selectAccount,
    logins: DeltaChatAccount[] | null
  }) {
    const switchAccount = useCallback(async (accountId: number) => {
      if (selectedChat) {
        unselectChat()
      }
      await DeltaBackend.call('login.logout')
      window.__changeScreen(Screens.Accounts)
      selectAccount(accountId)
      window.__changeScreen(Screens.Main)

    }, [selectedChat])
    return (
        <div className="account-sidebar">
                {logins !== null && logins.map(account => {
                    if (account.type === 'unconfigured') return null
                    return (
                            <div className="account" onClick={() => switchAccount(account.id)}>
                                <Avatar
                                    displayName={account.display_name === null ? '' : account.display_name}
                                    avatarPath={account.profile_image === null ? undefined : account.profile_image}
                                />
                            </div>
                    )
                })}
            <div onClick={() => {window.__changeScreen(Screens.Login)}}>
                <Avatar
                    avatarPath={undefined}
                    color={'#505050'}
                    displayName={"+"}
                />
            </div>
        </div>
    )
}
