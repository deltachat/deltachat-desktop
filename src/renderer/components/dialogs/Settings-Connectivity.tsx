import { useEffect, useMemo, useState, useRef } from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import React from 'react'

import {
  DeltaDialogBody,
  DeltaDialogCloseFooter,
  DeltaDialogBase,
  DeltaDialogHeader,
} from './DeltaDialog'
import { DeltaBackend } from '../../delta-remote'
import { onDCEvent } from '../../ipc'
import { debounceWithInit } from '../chat/ChatListHelpers'
import { DialogProps } from './DialogController'
import { useTranslationFunction } from '../../contexts'

const INHERIT_STYLES = ['line-height', 'background-color', 'color', 'font-size']
const OverwrittenStyles =
  'font-family: Arial, Helvetica, sans-serif;font-variant-ligatures: none;'

export default function SettingsConnectivityDialog({
  onClose,
  isOpen,
}: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const tx = useTranslationFunction()

  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={true}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DeltaDialogHeader title={tx('pref_edit_profile')} />
      {SettingsConnectivityInner()}
      <DeltaDialogCloseFooter onClose={onClose} />
    </DeltaDialogBase>
  )
}

export async function getConnectivityHTML(
  styleSensor: React.MutableRefObject<HTMLDivElement | null>
): Promise<string> {
  let cHTML = await DeltaBackend.call('context.getConnectivityHTML')

  if (styleSensor.current) {
    const cstyle = window.getComputedStyle(styleSensor.current)
    let resulting_style = ''
    for (const property of INHERIT_STYLES) {
      resulting_style += `${property}: ${cstyle.getPropertyValue(property)};`
    }
    cHTML = cHTML.replace(
      '</style>',
      `</style><style> html {${resulting_style}${OverwrittenStyles}}</style>`
    )
  }
  return cHTML
}

export function SettingsConnectivityInner() {
  const [connectivityHTML, setConnectivityHTML] = useState('')
  const styleSensor = useRef<HTMLDivElement | null>(null)

  const updateConnectivity = useMemo(
    () =>
      debounceWithInit(async () => {
        const cHTML = await getConnectivityHTML(styleSensor)
        setConnectivityHTML(cHTML)
      }, 240),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    updateConnectivity()
    return onDCEvent('DC_EVENT_CONNECTIVITY_CHANGED', updateConnectivity)
  })

  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
          <div ref={styleSensor} style={{ height: '100%', width: '100%' }}>
            <iframe
              style={{
                border: 0,
                height: '100%',
                width: '100%',
                minHeight: '320px',
              }}
              srcDoc={connectivityHTML}
              sandbox={''}
            />
          </div>
        </Card>
      </DeltaDialogBody>
    </>
  )
}
