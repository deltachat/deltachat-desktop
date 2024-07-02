import React from 'react'
import Radio from './Radio'

type RadioGroupProps = {
  onChange?: (value: string) => void
  selectedValue: string
  name: string
  children: any
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
        {Array.isArray(children) ? (
          children.map((radio: any) => (
            <Radio
              {...radio.props}
              selected={radio.props.value === selectedValue}
              onSelect={() => onChange && onChange(radio.props.value)}
              name={name}
            />
          ))
        ) : (
          <Radio
            {...children.props}
            selected={children.props.value === selectedValue}
            onSelect={() => onChange && onChange(children.props.value)}
            name={name}
          />
        )}
      </fieldset>
    </form>
  )
}
