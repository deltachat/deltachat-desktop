import React from "react";
import { DeltaChatAccount } from "../../shared/shared-types";
import ScreenController, { Screens } from "../ScreenController";
import { Avatar } from "./Avatar";
import { PseudoListItemAddContact } from "./helpers/PseudoListItem";

export default function AccountSidebar ({
    selectAccount,
    logins,
  }: {
    selectAccount: typeof ScreenController.prototype.selectAccount,
    logins: DeltaChatAccount[] | null
  }) {
    return (
        <div className="account-sidebar">
                {logins !== null && logins.map(account => {
                    if (account.type === 'unconfigured') return null
                    return (
                            <div className="account" onClick={() => selectAccount(account.id)}>
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