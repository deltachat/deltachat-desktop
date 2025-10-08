import React from 'react'

import reactStringReplace from 'react-string-replace'
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
import { selectedAccountId } from '../../ScreenController'

import type { DialogProps } from '../../contexts/DialogContext'

type PunycodeWarning = {
  original_hostname: string
  ascii_hostname: string
  punycode_encoded_url: string
}
type LinkDestination = {
  target: string
  hostname: null | string
  punycode: null | PunycodeWarning
  scheme: null | string
  linkText?: string
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
  const { target, punycode, scheme, linkText } = destination

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
        asciiUrl: scheme
          ? punycode.punycode_encoded_url
          : `https://${punycode.punycode_encoded_url}`,
      })
    } else {
      openLinkSafely(accountId, scheme ? target : `https://${target}`)
    }
  }

  return (
    <a
      href={asciiUrl}
      x-target-url={asciiUrl}
      title={asciiUrl}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {linkText ?? target}
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
