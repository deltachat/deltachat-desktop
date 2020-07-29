import React, { useContext, useState } from 'react'
import { ScreenContext } from '../../contexts'
import { toASCII } from 'punycode'
import { OpenDialogFunctionType } from '../dialogs/DialogController'
import {
  SmallDialog,
  DeltaDialogFooterActions,
  DeltaDialogFooter,
} from '../dialogs/DeltaDialog'
import { Classes } from '@blueprintjs/core'
import { DeltaCheckbox } from '../contact/ContactListItem'
import { getLogger } from '../../../shared/logger'

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
  const splittedTarget = String(target).split('/')
  // encode the punycode to make phishing harder
  const domain = (splittedTarget[2] = splittedTarget[2]
    .split('.')
    .map(toASCII)
    .join('.'))
  const sanitizedTarget = splittedTarget.join('/')
  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    //check if domain is trusted
    if (isDomainTrusted(domain)) {
      openExternal(target)
      return
    }
    // not trusted - ask for confimation from user
    confirmationDialog(
      openDialog as OpenDialogFunctionType,
      sanitizedTarget,
      domain,
      target
    )
  }
  return (
    <a href={'#' + target} title={sanitizedTarget} onClick={onClick}>
      {String(label)}
    </a>
  )
}

function confirmationDialog(
  openDialog: OpenDialogFunctionType,
  sanitizedTarget: string,
  domain: string,
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
              <i>{domain}</i>
            </div>
          </div>
          <DeltaDialogFooter>
            <DeltaDialogFooterActions>
              <p
                className={`delta-button bold primary`}
                onClick={onClose}
              >
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
                    trustDomain(domain)
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
