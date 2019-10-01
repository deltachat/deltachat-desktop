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
  letter-spacing: ${({ bold }) => bold === false ? '0px' : '2px'};
  font-size: initial;
  font-weight: ${({ bold }) => bold === false ? 'initial' : 'bold'};
  text-align: center;
  text-transform: uppercase;
  padding: 5px;
  border-style: solid;
  border-color: transparent;
  border-radius: 2px;
  &:hover {
    cursor: pointer;
    background-color: #f1f1f1;
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
