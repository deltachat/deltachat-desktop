import React, { Fragment } from 'react'
import { createGlobalStyle } from 'styled-components'
import { Dialog } from '@blueprintjs/core'
import classNames from 'classnames'

export const CreateDeltaDialogGlobal = createGlobalStyle`
    .DeltaDialog {
        position: absolute;
        top: 0;
    }
`

export function DeltaDialogBase(props) {
  return (
    <Fragment>
      <CreateDeltaDialogGlobal />
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        className={classNames('DeltaDialog', props.className)}
        style={props.style}
      >
      {props.children}
      </Dialog>
    </Fragment>
  )
}

export default function DeltaDialog (props) {
  return (
     <DeltaDialogBase {...props}>
        <div className='bp3-dialog-header'>
          <h4 className='bp3-heading'>{props.title}</h4>
          <button onClick={props.onClose} aria-label='Close' className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross' />
        </div>
        {props.children}
     </DeltaDialogBase>
  )
}
