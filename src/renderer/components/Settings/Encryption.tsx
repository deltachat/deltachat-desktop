import React, { useContext, useState } from 'react'
import { Card, Classes } from '@blueprintjs/core'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DialogProps } from '../dialogs/DialogController'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import InputTransferKey from '../InputTransferKey'
import { DialogFooter, DialogWithHeader, FooterActions } from '../Dialog'
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
    <React.Fragment>
      <div>
        <Card>
          <Callout>{tx('autocrypt_send_asm_explain_after')}</Callout>
          <div>
            <InputTransferKey
              autocryptkey={autocryptKey.split('-')}
              disabled
              onChange={undefined}
            />
          </div>
        </Card>
      </div>
      <DialogFooter>
        <FooterActions>
          <p className='delta-button bold' onClick={onClose}>
            {tx('done')}
          </p>
        </FooterActions>
      </DialogFooter>
    </React.Fragment>
  )
}

function InitiatePanel({ onClick }: { onClick: todo }) {
  const tx = useTranslationFunction()

  return (
    <div className={Classes.DIALOG_BODY}>
      <Card>
        <Callout>{tx('autocrypt_send_asm_explain_before')}</Callout>
        <p
          className='delta-button bold'
          style={{ float: 'right', marginTop: '20px' }}
          onClick={onClick}
        >
          {tx('ok')}
        </p>
      </Card>
    </div>
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
    <DialogWithHeader
      isOpen={isOpen}
      title={tx('autocrypt_send_asm_title')}
      onClose={onClose}
    >
      {body}
    </DialogWithHeader>
  )
}
