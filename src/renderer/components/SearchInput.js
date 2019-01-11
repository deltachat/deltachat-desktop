const React = require('react')
const { InputGroup } = require('@blueprintjs/core')
const styled = require('styled-components').default

const SearchInputWrapper = styled.div`
  width: 100%
  .bp3-input-group {
    width: 100%
  }
`

class SearchInput extends React.Component {
  render () {
    const tx = window.translate
    return (
      <SearchInputWrapper>
        <InputGroup
          type='search'
          large
          placeholder={tx('search')}
          leftIcon='search'
          {...this.props}
        />
      </SearchInputWrapper>
    )
  }
}

module.exports = SearchInput
