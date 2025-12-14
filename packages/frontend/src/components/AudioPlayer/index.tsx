import React from 'react'

import styles from './styles.module.scss'
import classNames from 'classnames'

type Props = React.AudioHTMLAttributes<HTMLAudioElement> & {
  src: string
}

export default function AudioPlayer({ src, className, ...restProps }: Props) {
  return (
    <audio
      controls
      className={classNames(styles.audioPlayer, className)}
      {...restProps}
    >
      <source src={src} />
    </audio>
  )
}
