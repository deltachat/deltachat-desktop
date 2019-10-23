import React from 'react'
import styled from 'styled-components'
import { CreateChatSearchInput } from './dialogs/CreateChat-Styles'
import classNames from 'classnames'

const SearchInputWrap = styled(CreateChatSearchInput)`
  margin-left: 40px;
  padding: 10px 0px;
  width: calc(100% - 80px);
  .bp3-navbar & {
    margin-left: 0px;
  }
`

export function ClearButton (props) {
  const { onChange, value } = props
  const onClear = () => onChange({ target: { value: '' } })

  return (
    <button
      aria-label='Clear'
      className={classNames(
        'bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross clear-button',
        { 'clear-button--hidden': value === '' }
      )}
      onClick={onClear} />
  )
}

export default function SearchInput (props) {
  const { onChange, value, className } = props
  const tx = window.translate
  return (
    <>
      <SearchInputWrap
        placeholder={tx('search')}
        autoFocus
        onChange={onChange}
        value={value}
        className={className}
      />
      <ClearButton value={value} onChange={onChange} />
    </>
  )
}
