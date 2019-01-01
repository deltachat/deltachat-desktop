const React = require('react')
const { InputGroup } = require('@blueprintjs/core')

module.exports = function (props) {
  const tx = window.translate
  return <InputGroup
    type='search'
    large
    placeholder={tx('search')}
    leftIcon='search'
    {...props}
  />
}
