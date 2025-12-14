import React, { useState, useEffect } from 'react'
import reactStringReplace from 'react-string-replace'

import { getLogger } from '../../../../shared/logger'
import { gitHubUrl, gitHubLicenseUrl } from '../../../../shared/constants'
import { ClickableNonMailtoLink } from '../helpers/ClickableLink'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { BackendRemote } from '../../backend-com'
import { DialogBody, DialogContent, DialogWithHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import Button from '../Button'

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
      <h3>Debug Info for System &amp; Selected Account</h3>
      <p>
        Local Account Id:{' '}
        <b>{window.__selectedAccountId || '(no account selected)'}</b>
      </p>
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
        <Button onClick={copy2Clipboard}>{tx('copy_json')}</Button>
      </div>
    </>
  )
}

export default function About({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  const [coreVersion, setCoreVersion] = useState('')
  const [sqliteVersion, setSqliteVersion] = useState('')

  useEffect(() => {
    window.__aboutDialogOpened = true
    return () => {
      window.__aboutDialogOpened = false
    }
  }, [])

  useEffect(() => {
    BackendRemote.rpc.getSystemInfo().then(info => {
      setCoreVersion(info['deltachat_core_version'])
      setSqliteVersion(info['sqlite_version'])
    })
  }, [])

  const desktopString = reactStringReplace(
    tx('about_offical_app_desktop'),
    'Delta Chat',
    (_match, _index, offset) => (
      <ClickableNonMailtoLink key={offset} href='https://delta.chat'>
        {'Delta Chat'}
      </ClickableNonMailtoLink>
    )
  )
  let licenceAndSource = reactStringReplace(
    tx('about_licensed_under_desktop'),
    'GNU GPL version 3',
    (_match, _index, offset) => (
      <ClickableNonMailtoLink key={offset} href={gitHubLicenseUrl}>
        {'GNU GPL version 3'}
      </ClickableNonMailtoLink>
    )
  )
  licenceAndSource = reactStringReplace(
    licenceAndSource,
    'GitHub',
    (_match, _index, offset) => (
      <ClickableNonMailtoLink key={offset} href={gitHubUrl}>
        {'GitHub'}
      </ClickableNonMailtoLink>
    )
  )
  const { VERSION, GIT_REF } = runtime.getRuntimeInfo().buildInfo

  return (
    <DialogWithHeader
      width={600}
      height={500}
      title={tx('global_menu_help_about_desktop')}
      onClose={onClose}
    >
      <DialogBody>
        <DialogContent>
          <p>{desktopString}</p>
          <p>{licenceAndSource}</p>
          <h3>Versions</h3>
          <table>
            <tbody>
              <tr>
                <td>
                  <b>Delta Chat Desktop</b>
                </td>
                <td
                  style={{ userSelect: 'all' }}
                >{`${VERSION} (git: ${GIT_REF})`}</td>
              </tr>
              <tr>
                <td>Delta Chat Core</td>
                <td style={{ color: 'grey', userSelect: 'all' }}>
                  {coreVersion}
                </td>
              </tr>
              <tr style={{ color: 'grey' }}>
                <td>SQLite</td>
                <td style={{ userSelect: 'all' }}>{sqliteVersion}</td>
              </tr>
              {runtime.getRuntimeInfo().versions.map(({ label, value }) => (
                <tr key={label} style={{ color: 'grey' }}>
                  <td>{label}</td>
                  <td style={{ userSelect: 'all' }}>{value}</td>
                </tr>
              ))}
              {runtime.getRuntimeInfo().target === 'browser' && (
                <tr key={'browser-version'} style={{ color: 'grey' }}>
                  <td>Browser UA</td>
                  <td style={{ userSelect: 'all' }}>{navigator.userAgent}</td>
                </tr>
              )}
              {runtime.getRuntimeInfo().runningUnderARM64Translation && (
                <tr>
                  <td>runningUnderARM64Translation</td>
                  <td>
                    {runtime.getRuntimeInfo().runningUnderARM64Translation}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <DCInfo />
          <h3>Additional information about the runtime</h3>
          <table>
            <tbody>
              <tr>
                <td>Runtime</td>
                <td>{runtime.constructor.name}</td>
              </tr>
              {runtime.getRuntimeInfo().rpcServerPath && (
                <tr>
                  <td>Path to core</td>
                  <td>{runtime.getRuntimeInfo().rpcServerPath}</td>
                </tr>
              )}
              {runtime.getRuntimeInfo().runningUnderARM64Translation !==
                undefined && (
                <tr>
                  <td>running under arm64 translation</td>
                  <td>
                    {runtime.getRuntimeInfo().runningUnderARM64Translation
                      ? 'true'
                      : 'false / native'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <br /> {/* some space at the bottom of the dialog */}
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}
