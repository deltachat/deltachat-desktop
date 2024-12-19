import React, { useContext, useState } from 'react'

import { DeltaCheckbox } from '../contact/ContactListItem'
import { getLogger } from '../../../../shared/logger'
import reactStringReplace from 'react-string-replace'
import { runtime } from '@deltachat-desktop/runtime-interface'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useDialog from '../../hooks/dialog/useDialog'
import useOpenLinkSafely from '../../hooks/useOpenLinkSafely'
import useProcessQr from '../../hooks/useProcessQr'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { isInviteLink } from '@deltachat-desktop/shared/util'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import { selectedAccountId } from '../../ScreenController'

import type { LinkDestination } from '@deltachat/message_parser_wasm'
import type { DialogProps } from '../../contexts/DialogContext'

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
  tabIndex,
}: {
  label: string | JSX.Element | JSX.Element[]
  destination: LinkDestination
  tabIndex: -1 | 0
}) => {
  const { openDialog } = useDialog()
  const openLinkSafely = useOpenLinkSafely()
  const processQr = useProcessQr()
  const messageDisplay = useContext(MessagesDisplayContext)
  const accountId = selectedAccountId()
  const { target, punycode, hostname } = destination

  // encode the punycode to make phishing harder
  const realUrl = punycode ? punycode.punycode_encoded_url : target
  const hostName = punycode ? punycode.ascii_hostname : hostname

  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    const isDeviceChat =
      messageDisplay?.context == 'chat_messagelist'
        ? messageDisplay.isDeviceChat
        : false

    if (isInviteLink(target)) {
      processQr(accountId, target)
      return
    }

    //check if domain is trusted, or if there is no domain like on mailto just open it
    if (isDeviceChat || !hostName || isDomainTrusted(hostName)) {
      openLinkSafely(accountId, target)
      return
    }
    // not trusted - ask for confirmation from user
    openDialog(LabeledLinkConfirmationDialog, { realUrl, hostName, target })
  }
  return (
    <a
      href={'#' + target}
      x-target-url={target}
      title={realUrl}
      onClick={onClick}
      tabIndex={tabIndex}
      onContextMenu={ev => ((ev as any).t = ev.currentTarget)}
    >
      {label}
    </a>
  )
}

function LabeledLinkConfirmationDialog(
  props: {
    realUrl: string
    hostName: string
    target: string
  } & DialogProps
) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const openLinkSafely = useOpenLinkSafely()
  const [isChecked, setIsChecked] = useState(false)
  const toggleIsChecked = () => setIsChecked(checked => !checked)

  return (
    <Dialog onClose={props.onClose}>
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
            {props.realUrl}
          </p>
          <div style={{ display: 'flex' }}>
            <DeltaCheckbox checked={isChecked} onClick={toggleIsChecked} />
            <div style={{ alignSelf: 'center' }}>
              {reactStringReplace(
                tx('open_external_url_trust_domain', '$$hostname$$'),
                '$$hostname$$',
                () => (
                  <i>{props.hostName}</i>
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
              runtime
                .writeClipboardText(props.target)
                .then(() => props.onClose())
            }}
          >
            {tx('copy')}
          </FooterActionButton>
          <FooterActionButton onClick={props.onClose}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            onClick={() => {
              props.onClose()
              if (isChecked) {
                // trust url
                trustDomain(props.hostName)
              }
              openLinkSafely(accountId, props.target)
            }}
          >
            {tx('open')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}

export const Link = ({
  destination,
  tabIndex,
}: {
  destination: LinkDestination
  tabIndex: -1 | 0
}) => {
  const { openDialog } = useDialog()
  const openLinkSafely = useOpenLinkSafely()
  const accountId = selectedAccountId()
  const { target, punycode } = destination
  const processQr = useProcessQr()
  const asciiUrl = punycode ? punycode.punycode_encoded_url : target

  const onClick = (ev: any) => {
    ev.preventDefault()
    ev.stopPropagation()

    if (isInviteLink(target)) {
      processQr(accountId, target)
      return
    }

    if (punycode) {
      openDialog(PunycodeUrlConfirmationDialog, {
        originalHostname: punycode.original_hostname,
        asciiHostname: punycode.ascii_hostname,
        asciiUrl: punycode.punycode_encoded_url,
      })
    } else {
      openLinkSafely(accountId, target)
    }
  }

  return (
    <a
      href='#'
      x-target-url={asciiUrl}
      title={asciiUrl}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {target}
    </a>
  )
}

function PunycodeUrlConfirmationDialog(
  props: {
    originalHostname: string
    asciiHostname: string
    asciiUrl: string
  } & DialogProps
) {
  const tx = useTranslationFunction()
  const openLinkSafely = useOpenLinkSafely()
  const accountId = selectedAccountId()

  return (
    <Dialog onClose={props.onClose}>
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
                <b>{props.asciiHostname}</b>
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
                () => <b>{props.originalHostname}</b>
              ),
              '$$asciiHostname$$',
              () => (
                <b>{props.asciiHostname}</b>
              )
            )}
          </p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={props.onClose}>
            {tx('no')}
          </FooterActionButton>
          <FooterActionButton
            onClick={() => {
              props.onClose()
              openLinkSafely(accountId, props.asciiUrl)
            }}
          >
            {tx('open')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
