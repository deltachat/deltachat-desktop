import {EncryptionModus} from '@deltachat/jsonrpc-client/dist/generated/types'
import classNames from 'classnames'
import React, { forwardRef, useState } from 'react'
import { DeltaRadiobutton } from '../LoginForm'

function EncryptionMode({
  className,
  text,
  onClick,
  checked,
}: {
  className: string
  text: string
  onClick: () => void
  checked: boolean
}) {
  return (
    <div className={classNames('encryption-mode', className)} onClick={onClick}>
      <div className='encryption-mode-icon'>
        <span />
      </div>
      <div className='encryption-mode-text'>{text}</div>
      <div className='encryption-mode-radiobutton'>
        <DeltaRadiobutton checked={checked} onClick={onClick} />
      </div>
    </div>
  )
}

export const EncryptionModusPopup = forwardRef<
  HTMLDivElement,
  {
    setShowEncryptionModusPopup: (state: boolean) => void
    encryptionModus: EncryptionModus
    setEncryptionModus: (modus: EncryptionModus) => void 
  }
>(({setShowEncryptionModusPopup, encryptionModus, setEncryptionModus}, ref) => {
  return (
    <>
      <div className='encryption-modus-popup' ref={ref}>
        <div className='encryption-modus-selector'>
          <EncryptionMode
            className='ForcePlaintext'
            text='Never encrypt'
            checked={encryptionModus === 'ForcePlaintext'}
            onClick={() => setEncryptionModus('ForcePlaintext')}
          />
          <EncryptionMode
            className='Opportunistic'
            text='Encrypt if possible'
            checked={encryptionModus === 'Opportunistic'}
            onClick={() => setEncryptionModus('Opportunistic')}
          />
          <EncryptionMode
            className='ForceEncrypted'
            text='Always encrypt'
            checked={encryptionModus === 'ForceEncrypted'}
            onClick={() => setEncryptionModus('ForceEncrypted')}
          />
        </div>
      </div>
    </>
  )
})
