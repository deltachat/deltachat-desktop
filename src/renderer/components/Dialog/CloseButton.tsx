import React, { ButtonHTMLAttributes } from 'react'

export default function CloseButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <div className='header-button-wrapper close-btn'>
      <button
        {...props}
        aria-label='Close'
        className='bp4-dialog-close-button bp4-button bp4-minimal bp4-icon-large bp4-icon-cross'
      />
    </div>
  )
}
