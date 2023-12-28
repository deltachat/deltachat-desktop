import React from 'react'
import classNames from 'classnames'

type SelectModeMaskProps = {
  isSelected: boolean
  selectMessage: () => void
  unselectMessage: () => void
}

export default function SelectModeMask({ isSelected, selectMessage, unselectMessage }: SelectModeMaskProps) {
  return (
    <div
      onClick={isSelected ? unselectMessage : selectMessage}
      className={classNames('select-mode-mask', isSelected && 'selected')}
    />
  )
}
