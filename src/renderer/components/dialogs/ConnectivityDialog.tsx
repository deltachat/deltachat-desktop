import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Card, Elevation } from '@blueprintjs/core'

import { debounceWithInit } from '../chat/ChatListHelpers'
import { DialogProps } from './DialogController'
import { useTranslationFunction } from '../../contexts'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, { CloseFooterAction, DialogBody, DialogHeader } from '../Dialog'

const INHERIT_STYLES = ['line-height', 'background-color', 'color', 'font-size']
const OverwrittenStyles =
  'font-family: Arial, Helvetica, sans-serif;font-variant-ligatures: none;'

export default function ConnectivityDialog({ onClose, isOpen }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={true}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DialogHeader title={tx('connectivity')} />
      {ConnectivityDialogInner()}
      <CloseFooterAction onClose={onClose} />
    </Dialog>
  )
}

function ConnectivityDialogInner() {
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
      <DialogBody>
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
      </DialogBody>
    </>
  )
}

async function getConnectivityHTML(
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
