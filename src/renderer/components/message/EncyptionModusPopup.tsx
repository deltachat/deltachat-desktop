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
  }
>((props, ref) => {
  const [state, setState] = useState('encrypt_if_possible')
  return (
    <>
      <div className='encryption-modus-popup' ref={ref}>
        <div className='encryption-modus-selector'>
          <EncryptionMode
            className='never_encrypt'
            text='Never encrypt'
            checked={state === 'never_encrypt'}
            onClick={() => setState('never_encrypt')}
          />
          <EncryptionMode
            className='encrypt_if_possible'
            text='Encrypt if possible'
            checked={state === 'encrypt_if_possible'}
            onClick={() => setState('encrypt_if_possible')}
          />
          <EncryptionMode
            className='always_encrypt'
            text='Always encrypt'
            checked={state === 'always_encrypt'}
            onClick={() => setState('always_encrypt')}
          />
        </div>
      </div>
    </>
  )
})
