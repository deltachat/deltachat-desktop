import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import React from 'react'

import { DeltaDialogBody, DeltaDialogCloseFooter } from './DeltaDialog'
import { DeltaBackend } from '../../delta-remote'
import { onDCEvent } from '../../ipc'

const INHERIT_STYLES = ['line-height', 'background-color', 'color', 'font-size']
const OverwrittenStyles =
  'font-family: Arial, Helvetica, sans-serif;font-variant-ligatures: none;'

export default function SettingsConnectivity({
  setShow,
}: {
  show: string
  setShow: (show: string) => void
  onClose: any
}) {
  const [connectivityHTML, setConnectivityHTML] = useState('')
  const styleSensor = useRef<HTMLDivElement | null>(null)

  const updateConnectivity = useMemo(
    () => async () => {
      let cHTML = await DeltaBackend.call('context.getConnectivityHTML')

      if (styleSensor.current) {
        const cstyle = window.getComputedStyle(styleSensor.current)
        let resulting_style = ''
        for (const property of INHERIT_STYLES) {
          resulting_style += `${property}: ${cstyle.getPropertyValue(
            property
          )};`
        }
        cHTML = cHTML.replace(
          '</style>',
          `</style><style> html {${resulting_style}${OverwrittenStyles}}</style>`
        )
      }

      setConnectivityHTML(cHTML)
    },
    [!styleSensor.current] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    updateConnectivity()
    return onDCEvent('DC_EVENT_CONNECTIVITY_CHANGED', updateConnectivity)
  }, [updateConnectivity])

  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
          <div ref={styleSensor} style={{ height: '100%', width: '100%' }}>
            <iframe
              style={{ border: 0, height: '100%', width: '100%' }}
              srcDoc={connectivityHTML}
              sandbox={''}
            />
          </div>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogCloseFooter onClose={() => setShow('main')} />
    </>
  )
}
