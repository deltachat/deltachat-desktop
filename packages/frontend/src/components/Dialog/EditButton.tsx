import React from 'react'

import HeaderButton from './HeaderButton'

import type { ButtonHTMLAttributes } from 'react'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export default function EditButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const tx = useTranslationFunction()

  return (
    <HeaderButton
      aria-label={props['aria-label'] ?? tx('global_menu_edit_desktop')}
      icon='lead-pencil'
      iconSize={24}
      {...props}
    />
  )
}
