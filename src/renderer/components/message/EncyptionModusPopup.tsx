import classNames from 'classnames'
import React, { forwardRef, useState } from 'react'
import { DeltaRadiobutton } from '../LoginForm'

export type EncryptionModus  = 'never_encrypt' | 'encrypt_if_possible' | 'always_encrypt'


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
            className='never_encrypt'
            text='Never encrypt'
            checked={encryptionModus === 'never_encrypt'}
            onClick={() => setEncryptionModus('never_encrypt')}
          />
          <EncryptionMode
            className='encrypt_if_possible'
            text='Encrypt if possible'
            checked={encryptionModus === 'encrypt_if_possible'}
            onClick={() => setEncryptionModus('encrypt_if_possible')}
          />
          <EncryptionMode
            className='always_encrypt'
            text='Always encrypt'
            checked={encryptionModus === 'always_encrypt'}
            onClick={() => setEncryptionModus('always_encrypt')}
          />
        </div>
      </div>
    </>
  )
})
