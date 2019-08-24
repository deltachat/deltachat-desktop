import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Dialog } from '@blueprintjs/core'

export const SmallDialogWrapper = createGlobalStyle`
  .bp3-small-dialog {
    width: 350px;
    padding-bottom: 0px;
    background-color: var(--bp3DialogBgPrimary);
  }

  .bp3-dialog-footer {
    margin-top: 16px;
    padding: 0 0px 0px;
  }
`

export const DeltaButton = styled.p`
  color: ${({ color }) => color || 'var(--colorNone)'};
  padding: ${({ noPadding }) => !noPadding ? '0 2px' : '0px'};
  margin-bottom: 0px;
  text-transform: uppercase;
  letter-spacing: ${({ bold }) => bold === false ? '0px' : '2px'};
  font-size: initial;
  letter-spacing: ${({ bold }) => bold === false ? 'initial' : 'bold'};
  &:hover {
    cursor: pointer;
  }
`

export const DeltaButtonPrimary = styled(DeltaButton)`
  color: var(--colorPrimary);
`
export const DeltaButtonDanger = styled(DeltaButton)`
  color: var(--colorDanger);
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
