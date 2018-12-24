const React = require('react')
const { InputGroup } = require('@blueprintjs/core')

module.exports = function (props) {
  const tx = window.translate
  return <InputGroup
    type='search'
    aria-label={tx('searchAriaLabel')}
    large
    placeholder={tx('search')}
    leftIcon='search'
    {...props}
  />
}
