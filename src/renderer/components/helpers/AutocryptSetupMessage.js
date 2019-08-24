import React from 'react'
import styled from 'styled-components'
import { Icon, InputGroup } from '@blueprintjs/core'

export const InputTransferKeyWrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 10px;
  padding: 20px 10px 20px 30px;
`

export const SetupMessagePartialInputWrapper = styled.div`
  width: 100%;

  .bp3-input {
    width: 66%;
    float: left;
  }

  .bp3-input:disabled {
    cursor: text;
  }
`

export const SetupMessagePartialInputSeperator = styled.div`
  width: 25%;
  float: right;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;

  .bp3-icon > svg:not([fill]) {
    fill: var(--bp3InputPlaceholder);
  }
`

export default function InputTransferKey ({ autocryptkey, onChange, disabled }) {
  if (disabled !== true) disabled = false
  const inputs = []
  for (let i = 0; i < 9; i++) {
    inputs.push(
      <SetupMessagePartialInputWrapper key={i}>
        <InputGroup
          key={i}
          data-index={i}
          id={'autocrypt-input-' + i}
          disabled={disabled}
          onChange={onChange}
          value={autocryptkey[i]}
        />
        {i !== 8 &&
          i !== 2 &&
          i !== 5 &&
            <SetupMessagePartialInputSeperator><Icon icon='small-minus' /></SetupMessagePartialInputSeperator>}
      </SetupMessagePartialInputWrapper>
    )
  }
  return <InputTransferKeyWrapper>{inputs}</InputTransferKeyWrapper>
}
