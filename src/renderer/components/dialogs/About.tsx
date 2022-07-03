import React, { useState, useEffect } from 'react'
import reactStringReplace from 'react-string-replace'
import { getLogger } from '../../../shared/logger'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import { gitHubUrl, gitHubLicenseUrl } from '../../../shared/constants'
import { VERSION, GIT_REF } from '../../../shared/build-info'
import ClickableLink from '../helpers/ClickableLink'
import { useTranslationFunction } from '../../contexts'
import { runtime } from '../../runtime'
import { BackendRemote } from '../../backend-com'

const log = getLogger('renderer/dialogs/About')

function getInfo() {
  if (window.__selectedAccountId === undefined) {
    return BackendRemote.rpc.getSystemInfo()
  } else {
    return BackendRemote.rpc.getInfo(window.__selectedAccountId)
  }
}

export function DCInfo(_props: any) {
  const tx = useTranslationFunction()
  const [content, setContent] = useState<{ [key: string]: any }>({})

  useEffect(function fetchContent() {
    getInfo().then(info => {
      setContent(info)
      log.debug('dcInfo', info)
    })
  }, [])

  const copy2Clipboard = () => {
    runtime.writeClipboardText(JSON.stringify(content, null, 4))
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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className='delta-button-round' onClick={copy2Clipboard}>
          {tx('copy_json')}
        </button>
      </div>
    </>
  )
}

export default function About(props: { isOpen: boolean; onClose: () => void }) {
  const { isOpen, onClose } = props
  const tx = useTranslationFunction()

  const desktopString = reactStringReplace(
    tx('about_offical_app_desktop'),
    'Delta Chat',
    (_match, _index, offset) => (
      <ClickableLink key={offset} href='https://delta.chat'>
        {'Delta Chat'}
      </ClickableLink>
    )
  )
  let versionString = reactStringReplace(
    tx('about_licensed_under_desktop'),
    'GNU GPL version 3',
    (_match, _index, offset) => (
      <ClickableLink key={offset} href={gitHubLicenseUrl}>
        {'GNU GPL version 3'}
      </ClickableLink>
    )
  )
  versionString = reactStringReplace(
    versionString,
    'GitHub',
    (_match, _index, offset) => (
      <ClickableLink key={offset} href={gitHubUrl}>
        {'GitHub'}
      </ClickableLink>
    )
  )

  return (
    <DeltaDialog
      isOpen={isOpen}
      title={tx('global_menu_help_about_desktop')}
      onClose={onClose}
    >
      <DeltaDialogBody>
        <div
          style={{ background: 'var(--bp4DialogBgPrimary)', padding: '21px' }}
        >
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
        </div>
      </DeltaDialogBody>
      <DeltaDialogFooter />
    </DeltaDialog>
  )
}
