const React = require('react')
const { openExternal } = require('../../ipc')


class ClickableLink extends React.Component {
  constructor (props) {
    super(props)
    this.href = props.href

    this.onClick = this.onClick.bind(this)
  }

  onClick (event) {
    event.preventDefault()
    openExternal(this.href)
  }

  render () {
    return (
      <a href={this.href} onClick={this.onClick}>{this.props.children}</a>
    )
  }
}

module.exports = ClickableLink
