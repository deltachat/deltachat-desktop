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

const log = getLogger('renderer/LabeledLink')

const { openExternal } = window.electron_functions

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
  target,
}: {
  label: string
  target: string
}) => {
  const { openDialog } = useContext(ScreenContext)

  const url = UrlParser(target)
  // encode the punycode to make phishing harder
  url.set(
    'hostname',
    url.hostname
      .split('.')
      .map(toASCII)
      .join('.')
  )

  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    //check if domain is trusted
    if (isDomainTrusted(url.hostname)) {
      openExternal(target)
      return
    }
    // not trusted - ask for confimation from user
    confirmationDialog(
      openDialog as OpenDialogFunctionType,
      url.toString(),
      url.hostname,
      target
    )
  }
  return (
    <a href={'#' + target} title={url.toString()} onClick={onClick}>
      {String(label)}
    </a>
  )
}

function confirmationDialog(
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
              {tx('open_external_url_trust_domain') + ' '}
              <i>{hostname}</i>
            </div>
          </div>
          <DeltaDialogFooter>
            <DeltaDialogFooterActions>
              <p className={`delta-button bold primary`} onClick={onClose}>
                {tx('no')}
              </p>
              <p
                className={`delta-button bold primary`}
                onClick={() => {
                  onClose()
                  navigator.clipboard.writeText(target)
                }}
              >
                {tx('menu_copy_link_to_clipboard')}
              </p>
              <p
                className={`delta-button bold primary`}
                onClick={() => {
                  onClose()
                  if (isChecked) {
                    // trust url
                    trustDomain(hostname)
                  }
                  openExternal(target)
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
