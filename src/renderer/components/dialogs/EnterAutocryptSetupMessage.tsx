import React, { useState, useContext } from 'react'
import { Card, Callout, Spinner, Classes } from '@blueprintjs/core'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { T } from '@deltachat/jsonrpc-client'

const log = getLogger('frontend/dialogs/EnterAutocryptSetupMessage')

export function SetupMessagePanel({
  setupCodeBegin,
  continueKeyTransfer,
}: {
  setupCodeBegin: string
  continueKeyTransfer: typeof EnterAutocryptSetupMessage.prototype.continueKeyTransfer
}) {
  const [key, setKey] = useState<string[]>([
    setupCodeBegin,
    ...Array(8).fill(''),
  ])

  const handleChangeKey = (
    event: React.FormEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!(event.target as any).value) {
      return
    }
    const eventTarget = event.target as HTMLInputElement
    const value = eventTarget.value
    const valueNumber = Number(value)
    const index = Number(eventTarget.getAttribute('data-index'))

    log.debug(`handleChangeKey: data-index ${index} value: ${value}`)
    if (
      value.length > 4 ||
      isNaN(valueNumber) ||
      valueNumber < 0 ||
      valueNumber > 9999
    ) {
      log.debug(`handleChangeKey: changed value is invalid`)
      return false
    }

    const updatedKey = key.map((item, i) => (i === index ? value : item))

    log.debug(`handleChangeKey: updatedKey: ${JSON.stringify(updatedKey)}`)
    setKey(updatedKey)
    if (value.length === 4) {
      const next = index + 1
      if (next <= 8) document.getElementById('autocrypt-input-' + next)?.focus()
    }
  }

  const onClick = () => continueKeyTransfer(key.join(''))

  const tx = window.static_translate

  log.debug(`render: key: ${key}`)

  return (
    <>
      <div>
        <Card>
          <Callout>
            {tx('autocrypt_continue_transfer_please_enter_code')}
          </Callout>
          <InputTransferKey autocryptkey={key} onChange={handleChangeKey} />
        </Card>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <p className='delta-button primary bold' onClick={onClick}>
            {tx('ok')}
          </p>
        </div>
      </div>
    </>
  )
}

export default function EnterAutocryptSetupMessage({
  onClose,
  message,
}: {
  onClose: () => void
  message: T.Message
}) {
  const { userFeedback } = useContext(ScreenContext)
  const [loading, setLoading] = useState<boolean>(false)

  const isOpen = !!message
  const setupCodeBegin = message && message.setupCodeBegin

  const tx = window.static_translate

  const continueKeyTransfer = async (key: string) => {
    setLoading(true)

    const result = await BackendRemote.rpc.continueAutocryptKeyTransfer(
      selectedAccountId(),
      message.id,
      key
    )
    setLoading(false)

    if (result === false) {
      userFeedback({
        type: 'error',
        text: tx('autocrypt_bad_setup_code'),
      })
      return
    }

    userFeedback({
      type: 'success',
      text: tx('autocrypt_correct_desktop'),
    })
    onClose()
  }

  let body
  if (loading) {
    body = (
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <Callout>
            <Spinner />
          </Callout>
        </Card>
      </div>
    )
  } else {
    if (!setupCodeBegin) {
      throw new Error('setupCodeBegin is missing')
    }

    body = (
      <SetupMessagePanel
        setupCodeBegin={setupCodeBegin}
        continueKeyTransfer={continueKeyTransfer}
      />
    )
  }

  return (
    <DeltaDialog
      isOpen={isOpen}
      title={tx('autocrypt_continue_transfer_title')}
      onClose={onClose}
    >
      {body}
    </DeltaDialog>
  )
}
