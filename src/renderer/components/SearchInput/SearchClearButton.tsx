import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

type Props = {
  onClick: () => void
  isHidden: boolean
}

export function SearchClearButton(props: Props) {
  const { isHidden, onClick } = props

  return (
    <button
      aria-label='Clear'
      className={classNames(
        styles.searchClearButton,
        'bp4-dialog-close-button bp4-button bp4-minimal bp4-icon-large bp4-icon-cross',
        { [styles.hidden]: isHidden }
      )}
      onClick={onClick}
    />
  )
}
