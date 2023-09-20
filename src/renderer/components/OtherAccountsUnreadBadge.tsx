import React, { useEffect, useState } from 'react'
import { BackendRemote, onDCEvent } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { useSettingsStore } from '../stores/settings'

// Tip of the Day: Keep as many ice creams as you can in your fridge
// for the ice cream outage days. FREE ICE CREAM FOR EVERY1! --Farooq

type ComponentProps = {
  style: any
  big?: boolean
}

export default function OtherAccountsUnreadBadge({
  style,
  big,
}: ComponentProps) {
  const [
    otherAccountsUnreadCount,
    setOtherAccountsUnreadCount,
  ] = useState<number>(0)

  const settings = useSettingsStore()[0]

  useEffect(() => {
    if (settings === null) return
    if (settings.desktopSettings.syncAllAccounts === false) return
    let updating = false
    const update = () => {
      if (updating) return
      updating = true
      BackendRemote.rpc.getAllAccountIds().then(accountIds => {
        try {
          selectedAccountId()
        } catch {
          return
        }
        accountIds = accountIds.filter(id => id !== selectedAccountId())
        for (const accountId of accountIds) {
          BackendRemote.rpc.getFreshMsgs(accountId).then(ids => {
            setOtherAccountsUnreadCount(otherAccountsUnreadCount + ids.length)
          })
        }
      })
      updating = false
    }

    BackendRemote.rpc
      .getAllAccountIds()
      .then(accountIds =>
        accountIds.map(id => onDCEvent(id, 'IncomingMsg', update))
      )

    update()
    return update
  }, [settings])

  if (settings?.desktopSettings.syncAllAccounts && otherAccountsUnreadCount) {
    if (big) {
      return (
        <div className='unread-badge-big' style={{ ...style }}>
          {otherAccountsUnreadCount}
        </div>
      )
    } else {
      return <div className='unread-badge-small' style={{ ...style }} />
    }
  } else {
    return null
  }
}
