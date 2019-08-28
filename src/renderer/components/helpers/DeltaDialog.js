import React, { Fragment } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Dialog } from '@blueprintjs/core'
import classNames from 'classnames'

export const CreateDeltaDialogGlobal = createGlobalStyle`
  .DeltaDialog {
    position: absolute;
    top: 0;
  }
  .bp3-dialog-header {
    padding-right: 4px;
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

export const DeltaDialogCloseButtonWrapper = styled.div`
  .bp3-icon-cross::before {
    font-size: x-large !important;
  }

  .bp3-icon-large {
    margin-right: 0px;
  }
  button:hover {
    background-color: unset !important;
  }
`

export function DeltaDialogCloseButton(props) {
    return (
      <DeltaDialogCloseButtonWrapper>
        <button {...props} aria-label='Close' className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross' />
      </DeltaDialogCloseButtonWrapper>
    )
}
export default function DeltaDialog (props) {
  return (
     <DeltaDialogBase {...props}>
        <div className='bp3-dialog-header'>
          <h4 className='bp3-heading'>{props.title}</h4>
          <DeltaDialogCloseButton onClick={props.onClose} />
        </div>
        {props.children}
     </DeltaDialogBase>
  )
}
