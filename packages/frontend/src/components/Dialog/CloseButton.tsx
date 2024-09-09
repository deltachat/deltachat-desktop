import React from 'react'

import HeaderButton from './HeaderButton'

import type { ButtonHTMLAttributes } from 'react'

export default function CloseButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <HeaderButton aria-label='Close' icon='cross' iconSize={26} {...props} />
  )
}
