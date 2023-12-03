import React, { useState, useContext } from 'react'
import { T } from '@deltachat/jsonrpc-client'

import { ScreenContext } from '../../contexts'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import InputTransferKey from '../InputTransferKey'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogWithHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'

const log = getLogger('frontend/dialogs/EnterAutocryptSetupMessage')

export default function EnterAutocryptSetupMessage({
  onClose,
  message,
}: {
  onClose: () => void
  message: T.Message
}) {
  const tx = window.static_translate
  const isOpen = !!message

  const { userFeedback } = useContext(ScreenContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  if (!message?.setupCodeBegin) {
    throw new Error('setupCodeBegin is missing')
  }

  const [key, setKey] = useState<string[]>([
    message.setupCodeBegin,
    ...Array(8).fill(''),
  ])

  const continueKeyTransfer = async () => {
    if (loading) {
      log.error('continueKeyTransfer already started')
      return
    }
    setLoading(true)

    try {
      await BackendRemote.rpc.continueAutocryptKeyTransfer(
        selectedAccountId(),
        message.id,
        key.join('')
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

  const handleChangeKey = (
    event: React.FormEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    const eventTarget = event.target as HTMLInputElement
    const value = eventTarget.value
    const valueNumber = Number(value)
    const index = Number(eventTarget.getAttribute('data-index'))

    log.debug(`handleChangeKey: data-index ${index} value: ${value}`)
    if (
      value !== '' && // fix: allow deleting the whole field
      (value.length > 4 ||
        isNaN(valueNumber) ||
        valueNumber < 0 ||
        valueNumber > 9999)
    ) {
      log.debug(`handleChangeKey: changed value is invalid`)
      return false
    }

    const updatedKey = key.map((item, i) => (i === index ? value : item))

    log.debug(`handleChangeKey: updatedKey: ${JSON.stringify(updatedKey)}`)
    setKey(updatedKey)

    // focus next field
    if (value.length === 4) {
      const next = index + 1
      if (next <= 8) document.getElementById('autocrypt-input-' + next)?.focus()
    }
  }

  return (
    <DialogWithHeader
      isOpen={isOpen}
      onClose={onClose}
      title={tx('autocrypt_continue_transfer_title')}
    >
      <DialogBody>
        <DialogContent>
          <p>{tx('autocrypt_continue_transfer_please_enter_code')}</p>
          {error && (
            <p className='autocrypt-setup-error'>
              {tx('autocrypt_bad_setup_code')}
              <br />
              {error}
            </p>
          )}
          <InputTransferKey autocryptkey={key} onChange={handleChangeKey} />
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={continueKeyTransfer}>
            {loading ? tx('loading') : tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </DialogWithHeader>
  )
}
