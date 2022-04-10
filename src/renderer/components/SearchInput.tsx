import React from 'react'
import classNames from 'classnames'
import { useTranslationFunction } from '../contexts'

export function ClearButton(props: {
  onChange: (event: { target: { value: '' } }) => void
  value: string
}) {
  const { onChange, value } = props
  const onClear = () => onChange({ target: { value: '' } })

  return (
    <button
      aria-label='Clear'
      className={classNames(
        'bp4-dialog-close-button bp4-button bp4-minimal bp4-icon-large bp4-icon-cross clear-button',
        { 'clear-button--hidden': value === '' }
      )}
      onClick={onClear}
    />
  )
}

export default function SearchInput(props: {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: '' } }
  ) => void
  value: string
  className: string
  id: string
  inputRef?: React.ClassAttributes<HTMLInputElement>['ref']
}) {
  const { onChange, value, className, id } = props
  const tx = useTranslationFunction()
  return (
    <>
      <input
        id={id}
        placeholder={tx('search')}
        autoFocus
        onChange={onChange}
        value={value}
        className={'search-input ' + className}
        ref={props.inputRef}
        spellCheck={false}
      />
      <ClearButton value={value} onChange={onChange} />
    </>
  )
}
