import { useEffect, useMemo, useRef, useState } from 'react'
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
  connectivityHTML,
}: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  connectivityHTML: string
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
      {SettingsConnectivityInner(connectivityHTML)}
      <DeltaDialogCloseFooter onClose={onClose} />
    </DeltaDialogBase>
  )
}

export async function getConnectivityHTML(): Promise<string> {
  let cHTML = await DeltaBackend.call('context.getConnectivityHTML')
  return cHTML
}

export function SettingsConnectivityInner(_connectivityHTML: string) {
  const [connectivityHTML, setConnectivityHTML] = useState(_connectivityHTML)

  const updateConnectivity = useMemo(
    () =>
      debounceWithInit(async () => {
        const cHTML = await getConnectivityHTML()
        setConnectivityHTML(cHTML)
      }, 240),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    return onDCEvent('DC_EVENT_CONNECTIVITY_CHANGED', updateConnectivity)
  }, [])

  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
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
        </Card>
      </DeltaDialogBody>
    </>
  )
}
