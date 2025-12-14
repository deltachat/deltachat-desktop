import React from 'react'

import HeaderButton from './HeaderButton'

import type { ButtonHTMLAttributes } from 'react'

export default function EditButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <HeaderButton
      aria-label='Edit'
      icon='lead-pencil'
      iconSize={24}
      {...props}
    />
  )
}
