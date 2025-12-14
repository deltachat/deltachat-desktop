import React from 'react'

import HeaderButton from './HeaderButton'

import type { ButtonHTMLAttributes } from 'react'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export default function CloseButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const tx = useTranslationFunction()

  return (
    <HeaderButton
      aria-label={props['aria-label'] ?? tx('close')}
      icon='cross'
      iconSize={26}
      {...props}
    />
  )
}
