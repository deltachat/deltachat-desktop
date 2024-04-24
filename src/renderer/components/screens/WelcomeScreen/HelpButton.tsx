import React from 'react'

import Icon from '../../Icon'
import { runtime } from '../../../runtime'

import styles from './styles.module.scss'

export default function HelpButton() {
  const handleClick = () => {
    // @TODO: Specify anchor for instant onboarding help chapter
    runtime.openHelpWindow()
  }

  return (
    <button onClick={handleClick} className={styles.instantOnboardingHelp}>
      <Icon className={styles.instantOnboardingHelpIcon} icon='info' />
    </button>
  )
}
