import React from 'react'
import classNames from 'classnames'

import { useReactionsBar } from '../ReactionsBar'

import styles from './styles.module.scss'

type Props = {
  visible: boolean
}

export default function ShortcutMenu(props: Props) {
  const { showReactionsBar } = useReactionsBar()

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // We don't want `OutsideClickHelper` to catch this event, causing
    // the reaction bar to directly hide again when switching to other
    // messages by clicking the "react" button
    event.stopPropagation()

    // Show reaction bar aligned centered with the "react" button
    const { x, y, width } = event.currentTarget.getBoundingClientRect()
    showReactionsBar(x + width / 2, y)
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
