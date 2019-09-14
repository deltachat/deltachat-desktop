import React from 'react'
import styled from 'styled-components'
import {
  CreateChatSearchInput
} from './dialogs/CreateChat-Styles'

const SearchInputWrap = styled(CreateChatSearchInput)`
margin-left: 40px;
padding: 10px 0px;
width: calc(100% - 80px);
`

export default class SearchInput extends React.Component {
  render () {
    const tx = window.translate
    return (
      <SearchInputWrap
        placeholder={tx('search')}
        autoFocus
        {...this.props}
      />
    )
  }
}
