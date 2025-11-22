import React, { useEffect } from 'react'
import reactStringReplace from 'react-string-replace'

import { gitHubUrl, gitHubLicenseUrl } from '../../../../shared/constants'
import { ClickableNonMailtoLink } from '../helpers/ClickableLink'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { BackendRemote } from '../../backend-com'
import { DialogBody, DialogContent, DialogWithHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import Button from '../Button'
import { useRpcFetch } from '../../hooks/useFetch'

/** all info gathered by about screen, will be copied by the copy action
 */
function useAboutInfo() {
  const runtimeInfo = runtime.getRuntimeInfo()

  const systemInfoFetch = useRpcFetch(BackendRemote.rpc.getSystemInfo, [])

  const accId = window.__selectedAccountId
  const accountInfoFetch = useRpcFetch(
    BackendRemote.rpc.getInfo,
    accId ? [accId] : null
  )
  const accountInfo = accountInfoFetch
    ? accountInfoFetch.lingeringResult
      ? accountInfoFetch.lingeringResult.ok
        ? { accountInfo: accountInfoFetch.lingeringResult.value }
        : {
            accountInfoError: JSON.stringify(
              accountInfoFetch.lingeringResult.err
            ),
          }
      : { accountInfoError: 'loading' }
    : { accountInfoError: 'no account selected' }

  const info = {
    runtimeName: runtime.constructor.name,
    runtimeInfo,
    systemInfo: systemInfoFetch?.lingeringResult?.ok
      ? systemInfoFetch.lingeringResult.value
      : null,
    systemInfoError:
      systemInfoFetch?.lingeringResult?.ok == false
        ? systemInfoFetch.lingeringResult
        : null,

    ...accountInfo,
  }

  const copyAction = () => {
    runtime.writeClipboardText(JSON.stringify({ info: info }, null, 4))
  }

  return {
    info,
    copyAction,
  }
}

function getVersionsForDisplay(info: ReturnType<typeof useAboutInfo>['info']) {
  const { VERSION, GIT_REF } = info.runtimeInfo.buildInfo
  const versions: { label: string; value: string; important?: true }[] = [
    {
      label: 'Delta Chat Desktop',
      value: `${VERSION} (git: ${GIT_REF})`,
      important: true,
    },
    {
      label: 'Delta Chat Core',
      value: info.systemInfo?.['deltachat_core_version'] || '?',
      important: true,
    },
    { label: 'SQLite', value: info.systemInfo?.['sqlite_version'] || '?' },
    ...info.runtimeInfo.versions,
  ]
  return versions
}

export default function About({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  const { info, copyAction } = useAboutInfo()

  const versions = getVersionsForDisplay(info)

  useEffect(() => {
    window.__aboutDialogOpened = true
    return () => {
      window.__aboutDialogOpened = false
    }
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

  const infoForTable = info.accountInfo || info.systemInfo

  return (
    <DialogWithHeader
      width={800}
      height={1000}
      title={tx('global_menu_help_about_desktop')}
      onClose={onClose}
    >
      <DialogBody>
        <DialogContent>
          <p>{desktopString}</p>
          <p>{licenceAndSource}</p>
          <h2>Debug Information</h2>
          <p>
            The following information is important when reporting problems to
            the developers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button onClick={copyAction}>{tx('menu_copy_to_clipboard')}</Button>
          </div>
          <h3>Versions</h3>
          <table>
            <tbody>
              {versions.map(({ label, value, important }) => (
                <tr
                  key={label}
                  style={{ color: important ? undefined : 'grey' }}
                >
                  <td>{label}</td>
                  <td style={{ userSelect: 'all' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Debug Info for System &amp; Selected Account</h3>
          <p>
            Local Account Id:{' '}
            <b>{window.__selectedAccountId || '(no account selected)'}</b>
          </p>
          {info.systemInfoError && (
            <p style={{ color: 'red' }}>
              Error fetching system info:{' '}
              {JSON.stringify(info.systemInfoError.err)}
            </p>
          )}
          {info.accountInfoError && (
            <p style={{ color: 'red' }}>
              Error fetching account info: {info.accountInfoError}
            </p>
          )}
          <div className='dialog-about__dc-details'>
            <table>
              <tbody>
                {infoForTable &&
                  Object.keys(infoForTable).map(key => (
                    <tr key={key}>
                      <td className='key'>{key.replace(/_/g, ' ')}</td>
                      <td className='value'>{infoForTable[key]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <h3>Additional information about the runtime</h3>
          <table>
            <tbody>
              <tr>
                <td>Runtime</td>
                <td>{info.runtimeName}</td>
              </tr>
              {info.runtimeInfo.rpcServerPath && (
                <tr>
                  <td>Path to core</td>
                  <td style={{ maxWidth: '500px' }}>
                    {info.runtimeInfo.rpcServerPath}
                  </td>
                </tr>
              )}
              {info.runtimeInfo.runningUnderARM64Translation !== undefined && (
                <tr>
                  <td>running under arm64 translation</td>
                  <td>
                    {info.runtimeInfo.runningUnderARM64Translation
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
