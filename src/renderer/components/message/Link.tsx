import React, { useContext, useState } from 'react'
import { ScreenContext } from '../../contexts'
import { toASCII } from 'punycode'
import { OpenDialogFunctionType } from '../dialogs/DialogController'
import {
  SmallDialog,
  DeltaDialogFooterActions,
  DeltaDialogFooter,
} from '../dialogs/DeltaDialog'
import { DeltaCheckbox } from '../contact/ContactListItem'
import { getLogger } from '../../../shared/logger'

import UrlParser from 'url-parse'
import chatStore from '../../stores/chat'
import reactStringReplace from 'react-string-replace'
import { runtime } from '../../runtime'

const log = getLogger('renderer/LabeledLink')

function getTrustedDomains(): string[] {
  return JSON.parse(localStorage.getItem('trustedDomains') || '[]')
}

function trustDomain(domain: string) {
  log.info('trustDomain', domain)
  const trusted: string[] = getTrustedDomains()
  trusted.push(domain)
  localStorage.setItem('trustedDomains', JSON.stringify(trusted))
}

function isDomainTrusted(domain: string): boolean {
  return getTrustedDomains().includes(domain)
}

function punycodeCheck(url: string) {
  const URL = UrlParser(url)
  // encode the punycode to make phishing harder
  const originalHostname = URL.hostname
  URL.set('hostname', URL.hostname.split('.').map(toASCII).join('.'))
  return {
    asciiUrl: URL.toString(),
    originalHostname,
    asciiHostname: URL.hostname,
    hasPunycode: URL.toString() != url,
  }
}

export const LabeledLink = ({
  label,
  target,
}: {
  label: string
  target: string
}) => {
  const { openDialog } = useContext(ScreenContext)

  const url = UrlParser(target)
  // encode the punycode to make phishing harder
  url.set('hostname', url.hostname.split('.').map(toASCII).join('.'))

  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    const { isDeviceChat } = chatStore.getState()
    //check if domain is trusted
    if (isDeviceChat || isDomainTrusted(url.hostname)) {
      runtime.openLink(target)
      return
    }
    // not trusted - ask for confimation from user
    labeledLinkConfirmationDialog(
      openDialog as OpenDialogFunctionType,
      url.toString(),
      url.hostname,
      target
    )
  }
  return (
    <a
      href={'#' + target}
      x-target-url={target}
      title={url.toString()}
      onClick={onClick}
    >
      {String(label)}
    </a>
  )
}

function labeledLinkConfirmationDialog(
  openDialog: OpenDialogFunctionType,
  sanitizedTarget: string,
  hostname: string,
  target: string
) {
  openDialog(({ isOpen, onClose }) => {
    const tx = window.static_translate
    const [isChecked, setIsChecked] = useState(false)
    const toggleIsChecked = () => setIsChecked(checked => !checked)
    return (
      <SmallDialog isOpen={isOpen} onClose={onClose}>
        <div className='bp3-dialog-body-with-padding'>
          <p>{tx('open_url_confirmation')}</p>
          <p
            style={{
              overflowWrap: 'break-word',
              overflowY: 'scroll',
              maxHeight: '50vh',
            }}
          >
            {sanitizedTarget}
          </p>
          <div style={{ display: 'flex' }}>
            <DeltaCheckbox checked={isChecked} onClick={toggleIsChecked} />
            <div style={{ alignSelf: 'center' }}>
              {reactStringReplace(
                tx('open_external_url_trust_domain', '$$hostname$$'),
                '$$hostname$$',
                () => (
                  <i>{hostname}</i>
                )
              )}
            </div>
          </div>
          <DeltaDialogFooter>
            <DeltaDialogFooterActions>
              <p
                className={`delta-button bold primary`}
                onClick={() => {
                  runtime.writeClipboardText(target).then(() => onClose())
                }}
                style={{ marginRight: 'auto' }}
              >
                {tx('copy')}
              </p>
              <p className={`delta-button bold primary`} onClick={onClose}>
                {tx('cancel')}
              </p>
              <p
                className={`delta-button bold primary`}
                onClick={() => {
                  onClose()
                  if (isChecked) {
                    // trust url
                    trustDomain(hostname)
                  }
                  runtime.openLink(target)
                }}
              >
                {tx('open')}
              </p>
            </DeltaDialogFooterActions>
          </DeltaDialogFooter>
        </div>
      </SmallDialog>
    )
  })
}

export const Link = ({ target }: { target: string }) => {
  const { openDialog } = useContext(ScreenContext)

  const {
    originalHostname,
    asciiHostname,
    hasPunycode,
    asciiUrl,
  } = punycodeCheck(target)

  const onClick = (ev: any) => {
    ev.preventDefault()
    ev.stopPropagation()

    if (hasPunycode) {
      openPunycodeUrlConfirmationDialog(
        openDialog as OpenDialogFunctionType,
        originalHostname,
        asciiHostname,
        asciiUrl
      )
    } else {
      runtime.openLink(target)
    }
  }
  return (
    <a
      href='#'
      {...{ 'x-target-url': asciiUrl }}
      title={asciiUrl}
      onClick={onClick}
    >
      {target}
    </a>
  )
}

function openPunycodeUrlConfirmationDialog(
  openDialog: OpenDialogFunctionType,
  originalHostname: string,
  asciiHostname: string,
  asciiUrl: string
) {
  openDialog(({ isOpen, onClose }) => {
    const tx = window.static_translate
    return (
      <SmallDialog isOpen={isOpen} onClose={onClose}>
        <div className='bp3-dialog-body-with-padding'>
          <div
            style={{
              fontSize: '1.5em',
              fontWeight: 'lighter',
              marginBottom: '6px',
            }}
          >
            {tx('puny_code_warning_header')}
          </div>
          <p>
            {reactStringReplace(
              tx('puny_code_warning_question', '$$asciiHostname$$'),
              '$$asciiHostname$$',
              () => (
                <b>{asciiHostname}</b>
              )
            )}
          </p>
          <hr />
          <p>
            {reactStringReplace(
              reactStringReplace(
                tx('puny_code_warning_description', [
                  '$$originalHostname$$',
                  '$$asciiHostname$$',
                ]),
                '$$originalHostname$$',
                () => <b>{originalHostname}</b>
              ),
              '$$asciiHostname$$',
              () => (
                <b>{asciiHostname}</b>
              )
            )}
          </p>
          <DeltaDialogFooter>
            <DeltaDialogFooterActions>
              <p className={`delta-button bold primary`} onClick={onClose}>
                {tx('no')}
              </p>
              <p
                className={`delta-button bold primary`}
                onClick={() => {
                  onClose()
                  runtime.openLink(asciiUrl)
                }}
              >
                {tx('open')}
              </p>
            </DeltaDialogFooterActions>
          </DeltaDialogFooter>
        </div>
      </SmallDialog>
    )
  })
}
