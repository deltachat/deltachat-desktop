import React from 'react'
import { Icon, InputGroup } from '@blueprintjs/core'

export default function InputTransferKey(
  props:
    | {
        autocryptkey: string[]
        onChange: ((event: React.FormEvent<HTMLElement>) => void) &
          ((event: React.ChangeEvent<HTMLInputElement>) => void)
      }
    | {
        autocryptkey: string[]
        disabled: true
      }
) {
  const inputs = []
  for (let i = 0; i < 9; i++) {
    inputs.push(
      <div className='row' key={i}>
        <InputGroup
          key={i}
          data-index={i}
          id={'autocrypt-input-' + i}
          disabled={(props as any).disabled || false}
          onChange={(props as any).onChange}
          value={props.autocryptkey[i]}
        />
        {i !== 8 && i !== 2 && i !== 5 && (
          <div className='seperator'>
            <Icon icon='small-minus' />
          </div>
        )}
      </div>
    )
  }
  return <div className='input-transfer-key'>{inputs}</div>
}
