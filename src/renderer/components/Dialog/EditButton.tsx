import React, { ButtonHTMLAttributes } from 'react'

export default function EditButton(
  props: ButtonHTMLAttributes<HTMLDivElement>
) {
  return (
    <div className='header-button-wrapper edit-btn'>
      <div {...props} />
    </div>
  )
}
