import React from 'react'

import styles from './styles.module.scss'

type Props = {
  src: string
  tabIndex?: 0 | -1
}

export default function AudioPlayer(props: Props) {
  return (
    // Despite the element having multiple interactive (pseudo?) elements
    // inside of it, tabindex works for all of them.
    <audio controls className={styles.audioPlayer} tabIndex={props.tabIndex}>
      <source src={props.src} />
    </audio>
  )
}
