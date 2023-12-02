import React, { useContext, useState } from 'react'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DialogProps } from '../dialogs/DialogController'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import InputTransferKey from '../InputTransferKey'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogWithHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import Callout from '../Callout'

export default function Encryption() {
  const { openDialog } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  return (
    <>
      <CoreSettingsSwitch
        settingsKey='e2ee_enabled'
        label={tx('autocrypt_prefer_e2ee')}
      />
      <SettingsButton
        highlight
        onClick={() => openDialog(SendAutocryptSetupMessage)}
      >
        {tx('autocrypt_send_asm_button')}
      </SettingsButton>
      <Callout>{tx('autocrypt_explain')}</Callout>
    </>
  )
}

export function KeyViewPanel({
  onClose,
  autocryptKey,
}: {
  onClose: DialogProps['onClose']
  autocryptKey: string
}) {
  const tx = useTranslationFunction()

  return (
    <>
      <DialogBody>
        <Callout>{tx('autocrypt_send_asm_explain_after')}</Callout>
        <DialogContent>
          <InputTransferKey
            autocryptkey={autocryptKey.split('-')}
            disabled
            onChange={undefined}
          />
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='center'>
          <FooterActionButton onClick={onClose}>
            {tx('done')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}

function InitiatePanel({ onClick }: { onClick: todo }) {
  const tx = useTranslationFunction()

  return (
    <>
      <DialogBody>
        <Callout>{tx('autocrypt_send_asm_explain_before')}</Callout>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='center'>
          <FooterActionButton onClick={onClick}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}

export function SendAutocryptSetupMessage({
  onClose: _onClose,
  isOpen,
}: {
  onClose: Function
  isOpen: boolean
}) {
  const tx = useTranslationFunction()
  const [key, setKey] = useState<string | null>(null)

  const onClose = () => {
    setKey(null)
    _onClose()
  }

  const initiateKeyTransfer = async () => {
    const key = await BackendRemote.rpc.initiateAutocryptKeyTransfer(
      selectedAccountId()
    )
    setKey(key)
  }

  let body
  if (key) {
    body = <KeyViewPanel autocryptKey={key} onClose={onClose} />
  } else {
    body = <InitiatePanel onClick={initiateKeyTransfer} />
  }

  return (
    <DialogWithHeader
      isOpen={isOpen}
      title={tx('autocrypt_send_asm_title')}
      onClose={onClose}
    >
      {body}
    </DialogWithHeader>
  )
}
