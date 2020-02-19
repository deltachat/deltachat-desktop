const React = require('react')
const { shell } = window.electron_functions

class ClickableLink extends React.Component {
  constructor (props) {
    super(props)
    this.href = props.href

    this.onClick = this.onClick.bind(this)
  }

  onClick (event) {
    event.preventDefault()
    shell.openExternal(this.href)
  }

  render () {
    return (
      <a href={this.href} onClick={this.onClick}>{this.props.children}</a>
    )
  }
}

module.exports = ClickableLink
