import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Dialog } from '@blueprintjs/core'

export const SmallDialogWrapper = createGlobalStyle`
  .bp3-small-dialog {
    width: 350px;
    padding-bottom: 0px;
    background-color: var(--bp3DialogCardBg);
  }

  .bp3-dialog-footer {
    margin-top: 16px;
    padding: 0 0px 0px;
  }
`

export const DeltaGreenButton = styled.p`
  color: #53948c;
  padding: 0px 7px;
  margin-bottom: 0px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: initial;
  font-weight: bold;
}  &:hover {
    cursor: pointer;
  }

`

export default function SmallDialog (props) {
  return (
    <React.Fragment>
      <SmallDialogWrapper />
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        canOutsideClickClose
        className='bp3-small-dialog'
      >
        {props.children}
      </Dialog>
    </React.Fragment>
  )
}
