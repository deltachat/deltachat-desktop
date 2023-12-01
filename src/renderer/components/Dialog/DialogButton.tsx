import React from 'react'

import type { PropsWithChildren } from 'react'

export default function DialogButton(
  props: PropsWithChildren<{ onClick: () => void }>
) {
  return (
    <div onClick={props.onClick} className='delta-dialog-button'>
      {props.children}
    </div>
  )
}
