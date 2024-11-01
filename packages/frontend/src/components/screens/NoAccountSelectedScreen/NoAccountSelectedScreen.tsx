import React from 'react'

import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'
import classNames from 'classnames'

export function NoAccountSelectedScreen() {
  const tx = useTranslationFunction()

  return (
    <div className={classNames(styles.noAccountSelectedScreen, 'drag')}>
      <div className={styles.background}>
        <div className={classNames(styles.infoBox, 'no-drag')}>
          {tx('no_account_selected')}
        </div>
      </div>
    </div>
  )
}
