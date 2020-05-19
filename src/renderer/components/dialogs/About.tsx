import React, { useState, useEffect } from 'react'
import { Card } from '@blueprintjs/core'
import reactStringReplace from 'react-string-replace'
import { getLogger } from '../../../shared/logger'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import { gitHubUrl, gitHubLicenseUrl } from '../../../shared/constants'
import { VERSION, GIT_REF } from '../../../shared/build-info'
import ClickableLink from '../helpers/ClickableLink'
import { DeltaBackend } from '../../delta-remote'

const log = getLogger('renderer/dialogs/About')

export function DCInfo(_props: any) {
  const [content, setContent] = useState(undefined)

  useEffect(function fetchContent() {
    DeltaBackend.call('getInfo').then(info => {
      setContent(info)
      log.debug('dcInfo', info)
    })
  }, [])

  const copy2Clipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 4))
  }

  const keys = content && Object.keys(content)

  return (
    <>
      <h3>Version details:</h3>
      <div className='dialog-about__dc-details'>
        <table>
          <tbody>
            {keys &&
              keys.map(key => (
                <tr key={key}>
                  <td className='key'>{key.replace(/_/g, ' ')}</td>
                  <td className='value'>{content[key]}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <button style={{ float: 'right' }} onClick={copy2Clipboard}>
        Copy JSON
      </button>
    </>
  )
}

export default function About(props: { isOpen: boolean; onClose: () => void }) {
  const { isOpen, onClose } = props
  const tx = window.translate

  const desktopString = reactStringReplace(
    tx('about_offical_app_desktop'),
    'Delta Chat',
    () => (
      <ClickableLink href='https://delta.chat'>{'Delta Chat'}</ClickableLink>
    )
  )
  let versionString = reactStringReplace(
    tx('about_licensed_under_desktop'),
    'GNU GPL version 3',
    () => (
      <ClickableLink href={gitHubLicenseUrl}>
        {'GNU GPL version 3'}
      </ClickableLink>
    )
  )
  versionString = reactStringReplace(versionString, 'GitHub', () => (
    <ClickableLink href={gitHubUrl}>{'GitHub'}</ClickableLink>
  ))

  return (
    <DeltaDialog
      isOpen={isOpen}
      title={tx('global_menu_help_about_desktop')}
      onClose={onClose}
    >
      <DeltaDialogBody>
        <Card>
          <p
            style={{ color: 'grey', userSelect: 'all' }}
          >{`Version ${VERSION} (git: ${GIT_REF})`}</p>
          <p>
            {desktopString}
            <br />
            <br />
            {versionString}
          </p>
          <DCInfo />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogFooter />
    </DeltaDialog>
  )
}
