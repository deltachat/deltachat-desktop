import React, { useEffect, useMemo, useState, useRef } from 'react'

import { debounceWithInit } from '../chat/ChatListHelpers'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, {
  CloseFooterAction,
  DialogBody,
  DialogContent,
  DialogHeader,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { runtime } from '@deltachat-desktop/runtime-interface'

const INHERIT_STYLES = ['line-height', 'background-color', 'color', 'font-size']
const OverwrittenStyles =
  'font-family: Arial, Helvetica, sans-serif;font-variant-ligatures: none;'

export default function ConnectivityDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose} canOutsideClickClose={true}>
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

  // On Tauri we cannot inject dynamic styles due to more strict CSP,
  // so let's fall back to light theme,
  // white background.
  // TODO fix. Maybe we could at least have two styles for dark and light.
  //
  // TODO also the progress bar's "width" style is not applied
  // https://github.com/chatmail/core/blob/f03dc6af122b271bb586e9821977c55117a8b9fa/src/scheduler/connectivity.rs#L512
  const canInjectStyles = runtime.getRuntimeInfo().target !== 'tauri'

  const updateConnectivity = useMemo(
    () =>
      debounceWithInit(async () => {
        const cHTML = await getConnectivityHTML(
          canInjectStyles ? styleSensor : undefined
        )
        setConnectivityHTML(cHTML)
      }, 240),
    [canInjectStyles]
  )

  useEffect(() => {
    updateConnectivity()
    return onDCEvent(accountId, 'ConnectivityChanged', updateConnectivity)
  }, [accountId, updateConnectivity])

  return (
    <DialogBody>
      <DialogContent>
        <div ref={styleSensor} style={{ height: '100%', width: '100%' }}>
          <iframe
            style={{
              border: 0,
              height: '100%',
              width: '100%',
              minHeight: '320px',
              backgroundColor: canInjectStyles ? undefined : 'white',
              color: canInjectStyles ? undefined : 'black',
            }}
            srcDoc={connectivityHTML}
            sandbox={''}
          />
        </div>
      </DialogContent>
    </DialogBody>
  )
}

async function getConnectivityHTML(
  styleSensor?: React.RefObject<HTMLDivElement | null>
): Promise<string> {
  let cHTML = await BackendRemote.rpc.getConnectivityHtml(selectedAccountId())

  if (styleSensor?.current) {
    const cstyle = window.getComputedStyle(styleSensor.current)
    let resulting_style = ''
    for (const property of INHERIT_STYLES) {
      if (property === 'background-color') {
        // background-color is always
        // rgba(0,0,0,0) no matter what the theme bgColor is??
        continue
      }
      resulting_style += `${property}: ${cstyle.getPropertyValue(property)};`
    }
    if (cstyle.getPropertyValue('color') === 'rgb(255, 255, 255)') {
      resulting_style += `background-color: #222;`
    } else {
      resulting_style += `background-color: white;`
    }
    cHTML = cHTML.replace(
      '</style>',
      `</style><style> html {${resulting_style}${OverwrittenStyles}}</style>`
    )
  }
  return cHTML
}
