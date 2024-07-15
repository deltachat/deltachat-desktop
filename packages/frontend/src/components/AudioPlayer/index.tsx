import React from 'react'

import styles from './styles.module.scss'

type Props = {
  src: string
}

export default function AudioPlayer(props: Props) {
  return (
    <audio controls className={styles.audioPlayer}>
      <source src={props.src} />
    </audio>
  )
}
