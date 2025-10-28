import React, { useEffect, useMemo, useState } from 'react'

import { debounceWithInit } from '../chat/ChatListHelpers'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { runtime } from '@deltachat-desktop/runtime-interface'

const OverwrittenStyles =
  'font-family: Arial, Helvetica, sans-serif;font-variant-ligatures: none;'

export default function ConnectivityDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose} canOutsideClickClose={true}>
      <DialogHeader title={tx('connectivity')} onClose={onClose} />
      {ConnectivityDialogInner()}
    </Dialog>
  )
}

function ConnectivityDialogInner() {
  const accountId = selectedAccountId()
  const [connectivityHTML, setConnectivityHTML] = useState('')

  const style = window.getComputedStyle(document.body)
  const bgColor = style.getPropertyValue('--bgPrimary')
  const textColor = style.getPropertyValue('--textPrimary')
  const stylesToInject = `background-color: ${bgColor}; color: ${textColor};`

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
          canInjectStyles ? stylesToInject : undefined
        )
        setConnectivityHTML(cHTML)
      }, 240),
    [canInjectStyles, stylesToInject]
  )

  useEffect(() => {
    updateConnectivity()
    return onDCEvent(accountId, 'ConnectivityChanged', updateConnectivity)
  }, [accountId, updateConnectivity])

  return (
    <DialogBody>
      <DialogContent>
        <iframe
          style={{
            border: 0,
            height: '100%',
            width: '100%',
            minHeight: '320px',
            backgroundColor: bgColor,
            color: textColor,
          }}
          srcDoc={connectivityHTML}
          sandbox={''}
        />
      </DialogContent>
    </DialogBody>
  )
}

async function getConnectivityHTML(
  stylesToInject?: string | undefined
): Promise<string> {
  let cHTML = await BackendRemote.rpc.getConnectivityHtml(selectedAccountId())

  if (stylesToInject) {
    cHTML = cHTML.replace(
      '</style>',
      `</style><style> html {${stylesToInject}${OverwrittenStyles}}</style>`
    )
  }
  return cHTML
}
