import React, { useEffect, useMemo, useState } from 'react'

import { debounceWithInit } from '../chat/ChatListHelpers'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

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

  const updateConnectivity = useMemo(
    () =>
      debounceWithInit(async () => {
        const cHTML = await getConnectivityHTML()
        setConnectivityHTML(cHTML)
      }, 240),
    []
  )

  useEffect(() => {
    updateConnectivity()
    return onDCEvent(accountId, 'ConnectivityChanged', updateConnectivity)
  }, [accountId, updateConnectivity])

  // dangerouslySetInnerHTML is fine since the content comes
  // from backend and is trusted
  return (
    <DialogBody>
      <DialogContent>
        <div
          style={{
            height: '100%',
            width: '100%',
            minHeight: '320px',
            overflow: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: connectivityHTML }}
        />
      </DialogContent>
    </DialogBody>
  )
}

function extractStylesAndBody(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract all style tags from the head
  const styleTags = Array.from(doc.head.querySelectorAll('style'))
  const stylesHTML = styleTags.map(tag => tag.outerHTML).join('\n')

  // Extract body content
  const bodyContent = doc.body.innerHTML

  return stylesHTML + bodyContent
}

async function getConnectivityHTML(): Promise<string> {
  let cHTML = await BackendRemote.rpc.getConnectivityHtml(selectedAccountId())

  cHTML = extractStylesAndBody(cHTML)

  return cHTML
}
