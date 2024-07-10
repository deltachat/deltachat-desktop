import React from 'react'
import Radio from './Radio'

type RadioGroupProps = {
  onChange?: (value: string) => void
  children: any
  selectedValue: string
  name: string
}

export default function RadioGroup({
  onChange,
  children,
  selectedValue,
  name,
}: RadioGroupProps) {
  return (
    <form>
      <fieldset className='radiogroup'>
        {children.map((radio: any, index: number) => {
          return (
            <Radio
              key={index}
              {...radio.props}
              selected={radio.props.value === selectedValue}
              onSelect={() => onChange && onChange(radio.props.value)}
              name={name}
            />
          )
        })}
      </fieldset>
    </form>
  )
}
