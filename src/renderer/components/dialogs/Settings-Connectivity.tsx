import { useEffect, useMemo, useState, useRef } from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import React from 'react'

import {
  DeltaDialogBody,
  DeltaDialogCloseFooter,
  DeltaDialogBase,
  DeltaDialogHeader,
} from './DeltaDialog'
import { debounceWithInit } from '../chat/ChatListHelpers'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

const INHERIT_STYLES = ['line-height', 'background-color', 'color', 'font-size']
const OverwrittenStyles =
  'font-family: Arial, Helvetica, sans-serif;font-variant-ligatures: none;'

export default function SettingsConnectivityDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <DeltaDialogBase
      onClose={onClose}
      canOutsideClickClose={true}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DeltaDialogHeader title={tx('connectivity')} />
      {SettingsConnectivityInner()}
      <DeltaDialogCloseFooter onClose={onClose} />
    </DeltaDialogBase>
  )
}

export async function getConnectivityHTML(
  styleSensor: React.MutableRefObject<HTMLDivElement | null>
): Promise<string> {
  let cHTML = await BackendRemote.rpc.getConnectivityHtml(selectedAccountId())

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
  const accountId = selectedAccountId()
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
    return onDCEvent(accountId, 'ConnectivityChanged', updateConnectivity)
  }, [accountId, updateConnectivity])

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
