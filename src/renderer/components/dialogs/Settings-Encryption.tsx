import React, { useContext, useState } from 'react'
import { Card, H5, Classes, Callout, Spinner } from '@blueprintjs/core'
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
          <Callout>{tx('show_key_transfer_message_desktop')}</Callout>
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

function KeyLoadingPanel() {
  return (
    <div className={Classes.DIALOG_BODY}>
      <Card>
        <Spinner />
      </Card>
    </div>
  )
}

function InitiatePanel({ onClick }: { onClick: todo }) {
  const tx = window.static_translate
  return (
    <div className={Classes.DIALOG_BODY}>
      <Card>
        <Callout>{tx('initiate_key_transfer_desktop')}</Callout>
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
  const [loading, setLoading] = useState<boolean>(false)
  const [key, setKey] = useState<string | null>(null)

  const onClose = () => {
    setKey(null)
    _onClose()
  }

  const initiateKeyTransfer = async () => {
    setLoading(true)
    const key = await BackendRemote.rpc.autocryptInitiateKeyTransfer(
      selectedAccountId()
    )

    setKey(key)
    setLoading(false)
  }

  const tx = window.static_translate

  let body
  if (loading) {
    body = <KeyLoadingPanel />
  } else if (key) {
    body = <KeyViewPanel autocryptKey={key} onClose={onClose} />
  } else {
    body = <InitiatePanel onClick={initiateKeyTransfer} />
  }

  return (
    <DeltaDialog
      isOpen={isOpen}
      title={tx('autocrypt_key_transfer_desktop')}
      onClose={onClose}
    >
      {body}
    </DeltaDialog>
  )
}

export default function SettingsEncryptio({
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
