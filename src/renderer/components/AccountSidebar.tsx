import React from "react";
import { DeltaChatAccount } from "../../shared/shared-types";
import ScreenController from "../ScreenController";
import { Avatar } from "./Avatar";

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

        </div>
    )
}