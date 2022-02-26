import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Card, Elevation, H5 } from '@blueprintjs/core'
import filesizeConverter from 'filesize'
import { ScreenContext } from '../../contexts'

import { DeltaBackend } from '../../delta-remote'
import ConfirmationDialog from './ConfirmationDialog'

export default function SettingsWebxdc() {
  const [usage, setUsage] = useState<{
    total_size: number
    data_size: number
  } | null>(null)

  const updateUsage = useCallback(() => {
    DeltaBackend.call('webxdc.getWebxdcDiskUsage').then(setUsage)
  }, [])

  useEffect(() => updateUsage(), [])

  const { openDialog } = useContext(ScreenContext)
  const tx = window.static_translate

  const deleteData = () => {
    openDialog(ConfirmationDialog, {
      message:
        "Delete all webxdc DOMStorage data, if you do that you might use some local settings of your webxdc's",
      confirmLabel: tx('delete'),
      cb: yes =>
        yes &&
        DeltaBackend.call('webxdc.clearWebxdcDOMStorage').then(updateUsage),
    })
  }

  const resetWebxdcSession = () =>
    DeltaBackend.call('webxdc.deleteWebxdcAccountData')

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
                <td>~{filesizeConverter(usage.data_size)}</td>
                <td>
                  <button onClick={deleteData}>Clear</button>
                </td>
              </tr>
              <tr>
                <td>Total:</td>
                <td>{filesizeConverter(usage.total_size)}</td>
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
