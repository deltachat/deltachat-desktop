import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

type Props = {
  visible: boolean
}

export default function ShortcutMenu(props: Props) {
  return (
    <div
      className={classNames(styles.shortcutMenu, {
        [styles.visible]: props.visible,
      })}
    >
      Huhu, Shortcut Menu!
    </div>
  )
}
