import React, { useState } from 'react'

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
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'

import type { DialogProps } from '../../contexts/DialogContext'
import ManageKeys from './ManageKeys'

export default function Encryption() {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  return (
    <>
      <CoreSettingsSwitch
        settingsKey='e2ee_enabled'
        label={tx('autocrypt_prefer_e2ee')}
      />
      <ManageKeys />
      <SettingsButton
        onClick={() => openDialog(SendAutocryptSetupMessage)}
      >
        {tx('autocrypt_send_asm_button')}
      </SettingsButton>
    </>
  )
}

export function KeyViewPanel({
  onClose,
  autocryptKey,
}: {
  autocryptKey: string
} & DialogProps) {
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

export function SendAutocryptSetupMessage({ onClose: _onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const [key, setKey] = useState<string | null>(null)

  const onClose = () => {
    setKey(null)
    _onClose()
  }

  const initiateKeyTransfer = async () => {
    const key =
      await BackendRemote.rpc.initiateAutocryptKeyTransfer(selectedAccountId())
    setKey(key)
  }

  let body
  if (key) {
    body = <KeyViewPanel autocryptKey={key} onClose={onClose} />
  } else {
    body = <InitiatePanel onClick={initiateKeyTransfer} />
  }

  return (
    <DialogWithHeader title={tx('autocrypt_send_asm_title')} onClose={onClose}>
      {body}
    </DialogWithHeader>
  )
}
