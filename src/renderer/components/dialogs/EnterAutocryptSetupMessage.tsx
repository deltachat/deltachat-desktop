import React, { useState, useContext } from 'react'
import { Card, Callout, Spinner, Classes } from '@blueprintjs/core'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'
import { DeltaBackend } from '../../delta-remote'
import { getLogger } from '../../../shared/logger'

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
    event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    const valueNumber = Number(value)
    const index = Number(event.target.getAttribute('data-index'))

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
      if (next <= 8) document.getElementById('autocrypt-input-' + next).focus()
    }
  }

  const onClick = () => continueKeyTransfer(key.join(''))

  const tx = window.translate

  log.debug(`render: key: ${key}`)

  return (
    <>
      <div className={Classes.DIALOG_BODY}>
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

type EnterAutocryptSetupMessageProps = Readonly<{
  onClose: DialogProps['onClose']
  message: MessageType
}>

export default function EnterAutocryptSetupMessage({
  onClose,
  message,
}: {
  onClose: () => void
  message: MessageType
}) {
  const { userFeedback } = useContext(ScreenContext)
  const [loading, setLoading] = useState<boolean>(false)

  const isOpen = !!message
  const setupCodeBegin = message && message.setupCodeBegin

  const tx = window.translate

  const continueKeyTransfer = async (key: string) => {
    setLoading(true)

    const result = await DeltaBackend.call(
      'autocrypt.continueKeyTransfer',
      message.msg.id,
      key
    )
    setLoading(false)

    if (result === 0) {
      userFeedback({
        type: 'error',
        text: tx('autocrypt_incorrect_desktop'),
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
        <Spinner />
      </div>
    )
  } else {
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
      title={tx('autocrypt_key_transfer_desktop')}
      onClose={onClose}
      canOutsideClickClose={false}
    >
      {body}
    </DeltaDialog>
  )
}
