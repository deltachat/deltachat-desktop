import React, { useContext, useState } from 'react'
import { Card, H5, Classes, Callout } from '@blueprintjs/core'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DialogProps } from '../dialogs/DialogController'
import DeltaDialog, {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from '../dialogs/DeltaDialog'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import InputTransferKey from '../InputTransferKey'

export default function Encryption() {
  const { openDialog } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  return (
    <>
      <H5>{tx('autocrypt')}</H5>
      <CoreSettingsSwitch
        key='e2ee_enabled'
        label={tx('autocrypt_prefer_e2ee')}
      />
      <SettingsButton
        style={{ color: 'var(--colorPrimary)', fontWeight: 'lighter' }}
        onClick={() => openDialog(SendAutocryptSetupMessage)}
      >
        {tx('autocrypt_send_asm_button')}
      </SettingsButton>
      <div className='bp4-callout'>{tx('autocrypt_explain')}</div>
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
      <DeltaDialogFooter>
        <DeltaDialogFooterActions>
          <p className='delta-button bold' onClick={onClose}>
            {tx('done')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
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
    <DeltaDialog
      isOpen={isOpen}
      title={tx('autocrypt_send_asm_title')}
      onClose={onClose}
    >
      {body}
    </DeltaDialog>
  )
}
