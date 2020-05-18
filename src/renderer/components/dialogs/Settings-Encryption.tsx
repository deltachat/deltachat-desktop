import React, { useContext, useEffect, useState } from 'react'
import {
  Card,
  Elevation,
  H5,
  Classes,
  Callout,
  Spinner,
} from '@blueprintjs/core'
import { SettingsButton } from './Settings'
import { ScreenContext } from '../../contexts'
import { DialogProps } from './DialogController'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'
import { DeltaBackend } from '../../delta-remote'

export function KeyViewPanel({
  onClose,
  autocryptKey,
}: {
  onClose: DialogProps['onClose']
  autocryptKey: string
}) {
  const tx = window.translate
  return (
    <React.Fragment>
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <Callout>{tx('show_key_transfer_message_desktop')}</Callout>
          <div className={Classes.DIALOG_BODY}>
            <InputTransferKey autocryptkey={autocryptKey.split('-')} disabled />
          </div>
        </Card>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <p className='delta-button bold' onClick={onClose}>
            {tx('done')}
          </p>
        </div>
      </div>
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
  const tx = window.translate
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
  const [key, setKey] = useState<string>(null)

  const onClose = () => {
    setKey(null)
    _onClose()
  }

  const initiateKeyTransfer = async () => {
    setLoading(true)
    const key = await DeltaBackend.call('autocrypt.initiateKeyTransfer')

    setKey(key)
    setLoading(false)
  }

  const tx = window.translate

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
      canOutsideClickClose={false}
    >
      {body}
    </DeltaDialog>
  )
}

export default function SettingsEncryptio({
  renderDeltaSwitch,
}: {
  renderDeltaSwitch: Function
}) {
  const { openDialog } = useContext(ScreenContext)
  const tx = window.translate
  return (
    <>
      <Card elevation={Elevation.ONE}>
        <H5>{tx('autocrypt')}</H5>
        <br />
        {renderDeltaSwitch('e2ee_enabled', tx('autocrypt_prefer_e2ee'))}
        <br />
        <SettingsButton
          style={{ color: 'var(--colorPrimary)', fontWeight: 'lighter' }}
          onClick={() => openDialog(SendAutocryptSetupMessage)}
        >
          {tx('autocrypt_send_asm_button')}
        </SettingsButton>
        <div className='bp3-callout'>{tx('autocrypt_explain')}</div>
      </Card>
    </>
  )
}
