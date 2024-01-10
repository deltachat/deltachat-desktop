import React from 'react'
import classNames from 'classnames'

import useReactionsShortcutBar from '../ReactionsShortcutBar/useReactionsShortcutBar'

import styles from './styles.module.scss'

type Props = {
  visible: boolean
}

export default function ShortcutMenu(props: Props) {
  const { showReactionsBar } = useReactionsShortcutBar()

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    showReactionsBar(event.clientX, event.clientY)
  }

  return (
    <div
      className={classNames(styles.shortcutMenu, {
        [styles.visible]: props.visible,
      })}
    >
      <button onClick={onClick}>React</button>
    </div>
  )
}
