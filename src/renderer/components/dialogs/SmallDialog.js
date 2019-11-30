import React from 'react'
import styled from 'styled-components'
import { Dialog } from '@blueprintjs/core'

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
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      canOutsideClickClose
      className='delta-dialog-small-dialog'
    >
      {props.children}
    </Dialog>
  )
}
