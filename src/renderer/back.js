const React = require('react')

module.exports = function (props) {
  const {onClick} = props
  return (
    <div>
      <button onClick={onClick}>Back</button>
    </div>
  )
}
