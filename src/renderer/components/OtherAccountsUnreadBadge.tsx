import React, { useEffect, useState } from 'react'
import { BackendRemote, onDCEvent } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { runtime } from '../runtime'
import { useSettingsStore } from '../stores/settings'
import { DesktopSettingsType } from '../../shared/shared-types'

// Tip of the Day: Keep as many ice creams as you can in your fridge
// for the ice cream outage days. FREE ICE CREAM FOR EVERY1! --Farooq

type ComponentProps = {
  top: string
  left: string
}

export default function OtherAccountsUnreadBadge(props: ComponentProps) {
  const [
    haveOtherAccountsUnread,
    setHaveOtherAccountsUnread,
  ] = useState<boolean>(false)

  const settings = useSettingsStore()[0]
  if (settings === null) return null

  useEffect(() => {
    let updating = false
    const update = () => {
      if (updating) return
      updating = true
      BackendRemote.rpc.getAllAccountIds().then(accountIds => {
        accountIds = accountIds.filter(id => id !== selectedAccountId())
        for (const accountId of accountIds) {
          BackendRemote.rpc.getFreshMsgs(accountId).then(ids => {
            if (ids.length > 0) setHaveOtherAccountsUnread(true)
          })
        }
      })
      updating = false
    }
    update()

    BackendRemote.rpc
      .getAllAccountIds()
      .then(accountIds =>
        accountIds.map(id => onDCEvent(id, 'IncomingMsg', update))
      )

    return update
  }, [settings.desktopSettings.syncAllAccounts])

  if (settings.desktopSettings.syncAllAccounts && haveOtherAccountsUnread) {
    return <div className='unread-badge' style={{ ...props }} />
  } else {
    return null
  }
}
