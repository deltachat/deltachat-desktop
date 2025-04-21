import React from 'react'
import Radio from './Radio'

type RadioGroupProps = {
  onChange?: (value: string) => void
  children: any
  selectedValue: string
  name: string
}

type RadioProps = Parameters<typeof Radio>[0]

export default function RadioGroup({
  onChange,
  children,
  selectedValue,
  name,
}: RadioGroupProps) {
  return (
    <form>
      <fieldset className='radiogroup'>
        {children.map(({ props }: { props: RadioProps }) => {
          return (
            <Radio
              {...props}
              selected={props.value === selectedValue}
              onSelect={() => onChange && onChange(props.value)}
              name={name}
              key={props.value}
            />
          )
        })}
      </fieldset>
    </form>
  )
}
