import React, { useEffect, useState } from 'react'
import { BackendRemote, onDCEvent } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { runtime } from '../runtime'
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
  const [isSyncAllEnabled, setIsSyncAllEnabled] = useState<boolean>(false)

  useEffect(() => {
    runtime
      .getDesktopSettings()
      .then((settings: DesktopSettingsType) =>
        setIsSyncAllEnabled(settings.syncAllAccounts)
      )
  })

  useEffect(() => {
    if (!isSyncAllEnabled) return
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
  }, [isSyncAllEnabled])

  if (haveOtherAccountsUnread) {
    return <div className='unread-badge' style={{ ...props }} />
  } else {
    return null
  }
}
