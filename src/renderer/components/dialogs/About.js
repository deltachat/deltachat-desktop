import React, { useState, useEffect } from 'react'
import { remote, ipcRenderer, clipboard } from 'electron'
import { Card } from '@blueprintjs/core'

import logger from '../../../logger'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import {
  appVersion,
  gitHubUrl,
  gitHubLicenseUrl
} from '../../../application-constants'

const log = logger.getLogger('renderer/dialogs/About')

export function ClickableLink (props) {
  const { href, text } = props
  const onClick = () => { remote.shell.openExternal(href) }

  return <a onClick={onClick} href={href}>{text}</a>
}

export function DCInfo (props) {
  const [content, setContent] = useState(undefined)

  useEffect(function fetchContent () {
    ipcRenderer.send('getDCinfo')
    ipcRenderer.once('dcInfo', (e, info) => {
      setContent(info)
      log.debug('dcInfo', info)
    })
  }, [])

  const copy2Clipboard = () => {
    clipboard.writeText(JSON.stringify(content, null, 4))
  }

  return (
    <>
      <h3>Version details:</h3>
      <textarea
        className='dialog-about__dc-info'
        rows='20'
        value={JSON.stringify(content, null, 4)}
        readOnly
      />
      <button style={{ float: 'right' }} onClick={copy2Clipboard}>Copy JSON</button>
    </>
  )
}

export default function About (props) {
  const { isOpen, onClose } = props
  const tx = window.translate

  return (
    <DeltaDialog
      isOpen={isOpen}
      title={tx('global_menu_help_about_desktop')}
      onClose={onClose}
    >
      <DeltaDialogBody>
        <Card>
          <p style={{ color: 'grey', userSelect: 'all' }}>{`Version ${appVersion()}`}</p>
          <p>
            This is the official <ClickableLink href='https://delta.chat' text='Delta Chat' /> Desktop app.<br /><br />
            This software is licensed under <ClickableLink href={gitHubLicenseUrl()} text='GNU GPL version 3' /> and the source code is available on <ClickableLink href={gitHubUrl()} text='GitHub' />.
          </p>
          <DCInfo />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogFooter />
    </DeltaDialog>
  )
}
