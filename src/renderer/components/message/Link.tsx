import React, { useContext, useState } from 'react'
import { ScreenContext } from '../../contexts'
import { OpenDialogFunctionType } from '../dialogs/DialogController'
import {
  SmallDialog,
  DeltaDialogFooterActions,
  DeltaDialogFooter,
} from '../dialogs/DeltaDialog'
import { DeltaCheckbox } from '../contact/ContactListItem'
import { getLogger } from '../../../shared/logger'

import chatStore from '../../stores/chat'
import reactStringReplace from 'react-string-replace'
import { runtime } from '../../runtime'
import { LinkDestination } from '@deltachat/message_parser_wasm'
import { openLinkSafely } from '../helpers/LinkConfirmation'

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

export const LabeledLink = ({
  label,
  destination,
}: {
  label: string | JSX.Element | JSX.Element[]
  destination: LinkDestination
}) => {
  const { openDialog } = useContext(ScreenContext)
  const { target, punycode, hostname } = destination

  // encode the punycode to make phishing harder
  const realUrl = punycode ? punycode.punycode_encoded_url : target
  const hostName = punycode ? punycode.ascii_hostname : hostname

  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    const isDeviceChat = chatStore.getState().chat?.isDeviceChat

    //check if domain is trusted, or if there is no domain like on mailto just open it
    if (isDeviceChat || !hostName || isDomainTrusted(hostName)) {
      openLinkSafely(target)
      return
    }
    // not trusted - ask for confirmation from user
    labeledLinkConfirmationDialog(
      openDialog as OpenDialogFunctionType,
      realUrl,
      hostName,
      target
    )
  }
  return (
    <a
      href={'#' + target}
      x-target-url={target}
      title={realUrl}
      onClick={onClick}
      onContextMenu={ev => ((ev as any).t = ev.currentTarget)}
    >
      {label}
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
        <div className='bp4-dialog-body-with-padding'>
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
                  openLinkSafely(target)
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

export const Link = ({ destination }: { destination: LinkDestination }) => {
  const { openDialog } = useContext(ScreenContext)

  const { target, punycode } = destination
  const asciiUrl = punycode ? punycode.punycode_encoded_url : target

  const onClick = (ev: any) => {
    ev.preventDefault()
    ev.stopPropagation()

    if (punycode) {
      openPunycodeUrlConfirmationDialog(
        openDialog as OpenDialogFunctionType,
        punycode.original_hostname,
        punycode.ascii_hostname,
        punycode.punycode_encoded_url
      )
    } else {
      openLinkSafely(target)
    }
  }
  return (
    <a href='#' x-target-url={asciiUrl} title={asciiUrl} onClick={onClick}>
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
        <div className='bp4-dialog-body-with-padding'>
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
                  openLinkSafely(asciiUrl)
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
