import React, { useState } from 'react'
import { LinkDestination } from '@deltachat/message_parser_wasm'

import { DeltaCheckbox } from '../contact/ContactListItem'
import { getLogger } from '../../../shared/logger'
import chatStore from '../../stores/chat'
import reactStringReplace from 'react-string-replace'
import { runtime } from '../../runtime'
import { openLinkSafely } from '../helpers/LinkConfirmation'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useDialog from '../../hooks/useDialog'
import { OpenDialog } from '../../contexts/DialogContext'

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
  const { openDialog } = useDialog()
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
      openLinkSafely(openDialog, target)
      return
    }
    // not trusted - ask for confirmation from user
    labeledLinkConfirmationDialog(openDialog, realUrl, hostName, target)
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
  openDialog: OpenDialog,
  sanitizedTarget: string,
  hostname: string,
  target: string
) {
  openDialog(({ onClose }) => {
    const tx = window.static_translate
    const [isChecked, setIsChecked] = useState(false)
    const toggleIsChecked = () => setIsChecked(checked => !checked)
    return (
      <Dialog onClose={onClose}>
        <DialogBody>
          <DialogContent paddingTop>
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
          </DialogContent>
        </DialogBody>
        <DialogFooter>
          <FooterActions>
            <FooterActionButton
              onClick={() => {
                runtime.writeClipboardText(target).then(() => onClose())
              }}
            >
              {tx('copy')}
            </FooterActionButton>
            <FooterActionButton onClick={onClose}>
              {tx('cancel')}
            </FooterActionButton>
            <FooterActionButton
              onClick={() => {
                onClose()
                if (isChecked) {
                  // trust url
                  trustDomain(hostname)
                }
                openLinkSafely(openDialog, target)
              }}
            >
              {tx('open')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </Dialog>
    )
  })
}

export const Link = ({ destination }: { destination: LinkDestination }) => {
  const { openDialog } = useDialog()

  const { target, punycode } = destination
  const asciiUrl = punycode ? punycode.punycode_encoded_url : target

  const onClick = (ev: any) => {
    ev.preventDefault()
    ev.stopPropagation()

    if (punycode) {
      openPunycodeUrlConfirmationDialog(
        openDialog,
        punycode.original_hostname,
        punycode.ascii_hostname,
        punycode.punycode_encoded_url
      )
    } else {
      openLinkSafely(openDialog, target)
    }
  }
  return (
    <a href='#' x-target-url={asciiUrl} title={asciiUrl} onClick={onClick}>
      {target}
    </a>
  )
}

function openPunycodeUrlConfirmationDialog(
  openDialog: OpenDialog,
  originalHostname: string,
  asciiHostname: string,
  asciiUrl: string
) {
  openDialog(({ onClose }) => {
    const tx = window.static_translate

    return (
      <Dialog onClose={onClose}>
        <DialogBody>
          <DialogContent paddingTop>
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
          </DialogContent>
        </DialogBody>
        <DialogFooter>
          <FooterActions>
            <FooterActionButton onClick={onClose}>
              {tx('no')}
            </FooterActionButton>
            <FooterActionButton
              onClick={() => {
                onClose()
                openLinkSafely(openDialog, asciiUrl)
              }}
            >
              {tx('open')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </Dialog>
    )
  })
}
