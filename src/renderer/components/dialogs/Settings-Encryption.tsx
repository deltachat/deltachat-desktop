import React, { useContext, useState } from 'react'
import { Card, H5, Classes, Callout } from '@blueprintjs/core'
import { RenderDeltaSwitch2Type, SettingsButton } from './Settings'
import { ScreenContext } from '../../contexts'
import { DialogProps } from './DialogController'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog, {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export function KeyViewPanel({
  onClose,
  autocryptKey,
}: {
  onClose: DialogProps['onClose']
  autocryptKey: string
}) {
  const tx = window.static_translate
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
  const tx = window.static_translate
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

  const tx = window.static_translate

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

export default function SettingsEncryption({
  renderDeltaSwitch2,
}: {
  renderDeltaSwitch2: RenderDeltaSwitch2Type
}) {
  const { openDialog } = useContext(ScreenContext)
  const tx = window.static_translate
  return (
    <>
      <H5>{tx('autocrypt')}</H5>
      {renderDeltaSwitch2({
        key: 'e2ee_enabled',
        label: tx('autocrypt_prefer_e2ee'),
      })}
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
