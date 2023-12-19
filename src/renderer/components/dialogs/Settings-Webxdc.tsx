import React, { useCallback, useEffect, useState } from 'react'
import { Card, Elevation, H5 } from '@blueprintjs/core'
import { filesize } from 'filesize'

import ConfirmationDialog from './ConfirmationDialog'
import { runtime } from '../../runtime'
import { selectedAccountId } from '../../ScreenController'
import { useDialog } from '../../hooks/useDialog'

export default function SettingsWebxdc() {
  const accountId = selectedAccountId()
  const [usage, setUsage] = useState<{
    total_size: number
    data_size: number
  } | null>(null)

  const updateUsage = useCallback(() => {
    runtime.getWebxdcDiskUsage(accountId).then(setUsage)
  }, [accountId])

  useEffect(() => updateUsage(), [updateUsage])

  const { openDialog } = useDialog()
  const tx = window.static_translate

  const deleteData = () => {
    openDialog(ConfirmationDialog, {
      message:
        "Delete all webxdc DOMStorage data, if you do that you might loose some local settings of your webxdc's",
      confirmLabel: tx('delete'),
      cb: yes =>
        yes && runtime.clearWebxdcDOMStorage(accountId).then(updateUsage),
    })
  }

  const resetWebxdcSession = () =>
    openDialog(ConfirmationDialog, {
      message:
        "Delete all webxdc DOMStorage data, if you do that you might loose some local settings of your webxdc's",
      confirmLabel: tx('delete'),
      cb: yes => {
        if (!yes || window.__selectedAccountId === undefined) {
          return
        }
        runtime.closeAllWebxdcInstances()
        runtime.deleteWebxdcAccountData(window.__selectedAccountId)
        runtime.restartApp()
      },
    })

  return (
    <>
      <Card elevation={Elevation.ONE}>
        <H5>{'Local Webxdc data usage'}</H5>
        {!usage && tx('loading')}
        {usage && (
          <table>
            <tbody>
              <tr>
                <td>DOMStorage</td>
                <td>~{filesize(usage.data_size)}</td>
                <td>
                  <button onClick={deleteData}>Clear</button>
                </td>
              </tr>
              <tr>
                <td>Total:</td>
                <td>{filesize(usage.total_size)}</td>
                <td>
                  <button onClick={resetWebxdcSession}>
                    Hard Reset (restarts deltachat)
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}
