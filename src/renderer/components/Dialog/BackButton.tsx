import React, { ButtonHTMLAttributes } from 'react'

export default function BackButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <div className='header-button-wrapper back-btn'>
      <button
        {...props}
        aria-label='Back'
        className='bp4-button bp4-minimal bp4-icon-large bp4-icon-arrow-left'
      />
    </div>
  )
}
