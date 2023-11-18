import React, { useState, useContext } from 'react'
import InputTransferKey from './AutocryptSetupMessage'
import DeltaDialog from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { T } from '@deltachat/jsonrpc-client'

const log = getLogger('frontend/dialogs/EnterAutocryptSetupMessage')

export default function EnterAutocryptSetupMessage({
  onClose,
  message,
}: {
  onClose: () => void
  message: T.Message
}) {
  const { userFeedback } = useContext(ScreenContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const isOpen = !!message
  const setupCodeBegin = message && message.setupCodeBegin

  const tx = window.static_translate

  const continueKeyTransfer = async (key: string) => {
    if (loading) {
      log.error('continueKeyTransfer already started')
    }
    setLoading(true)

    try {
      await BackendRemote.rpc.continueAutocryptKeyTransfer(
        selectedAccountId(),
        message.id,
        key
      )
      userFeedback({
        type: 'success',
        text: tx('autocrypt_correct_desktop'),
      })
      onClose()
    } catch (error: any) {
      setError(String(error?.['message'] ? error.message : error))
    } finally {
      setLoading(false)
    }
  }

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

  if (!setupCodeBegin) {
    throw new Error('setupCodeBegin is missing')
  }

  return (
    <DeltaDialog
      isOpen={isOpen}
      title={tx('autocrypt_continue_transfer_title')}
      onClose={onClose}
      className='enter-autocrypt-setup-message-dialog'
    >
      <div className='dialog-body'>
        <p>{tx('autocrypt_continue_transfer_please_enter_code')}</p>
        {error && (
          <p className='autocrypt-setup-error'>
            {tx('autocrypt_bad_setup_code')}
            <br />
            {error}
          </p>
        )}
        <InputTransferKey autocryptkey={key} onChange={handleChangeKey} />
      </div>

      <div className={'bp4-dialog-footer'}>
        <div className={'bp4-dialog-footer-actions'}>
          <p className='delta-button primary bold' onClick={onClick}>
            {loading ? tx('loading') : tx('ok')}
          </p>
        </div>
      </div>
    </DeltaDialog>
  )
}
