import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.css'

type Props = {
  onChange: (event: { target: { value: '' } }) => void
  value: string
  extraCleanAction?: () => void
}

export function SearchClearButton(props: Props) {
  const { onChange, extraCleanAction, value } = props

  const onClear = () => {
    onChange({ target: { value: '' } })
    extraCleanAction?.()
  }

  const isHidden = value === '' && !extraCleanAction

  return (
    <button
      aria-label='Clear'
      className={classNames(
        styles.searchClearButton,
        'bp4-dialog-close-button bp4-button bp4-minimal bp4-icon-large bp4-icon-cross',
        { [styles.hidden]: isHidden }
      )}
      onClick={onClear}
    />
  )
}
