import React from 'react'
import { SmallDialog } from './DeltaDialog'

export default function AlertDialog(props: todo) {
  const { message, cb } = props

  const isOpen = !!message
  const tx = window.translate
  const onClose = () => {
    props.onClose()
    // eslint-disable-next-line standard/no-callback-literal
  }

  const onClick = () => {
    cb()
    props.onClose()
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p>{message}</p>
        <p
          className={`delta-button no-padding bold primary'`}
          onClick={() => onClick()}
        >
          {tx('ok')}
        </p>
      </div>
    </SmallDialog>
  )
}
