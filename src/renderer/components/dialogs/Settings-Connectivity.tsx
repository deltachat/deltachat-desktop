import { useEffect, useState, useContext } from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import React from 'react'

import { DeltaDialogBody, DeltaDialogCloseFooter, DeltaDialogFooter, DeltaDialogOkCancelFooter } from './DeltaDialog'
import { DeltaBackend } from '../../delta-remote'
import { onDCEvent } from '../../ipc'

export default function SettingsConnectivity({
  setShow,
}: {
  show: string
  setShow: (show: string) => void
  onClose: any
}) {
  const [connectivityHTML, setConnectivityHTML] = useState('')
 
  const updateConnectivity = async () => {
    setConnectivityHTML(await DeltaBackend.call('context.getConnectivityHTML'))
  }

  useEffect(() => {
      updateConnectivity()
      return onDCEvent(
        'DC_EVENT_CONNECTIVITY_CHANGED',
        updateConnectivity
      )
  }, [])

  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE} style={{paddingTop: '0px'}}>
          <div dangerouslySetInnerHTML={{__html: connectivityHTML}} />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogCloseFooter onClose={() => setShow('main')} />
    </>
  )
}
