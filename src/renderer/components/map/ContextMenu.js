const React = require('react')

class ContextMenu extends React.Component {
  constructor (props) {
    super(props)
    this.poiLabel = React.createRef()
    this.onClick = this.onClick.bind(this)
  }

  onClick () {
    this.props.onSetPoi(this.poiLabel.current.value)
  }

  render () {
    return (
      <div className={'context-menu'}><input type={'text'} ref={this.poiLabel} placeholder={'Enter label here'} /><div className={'send-button-wrapper'}><button title={'Send POI'} onClick={this.onClick} /></div></div>
    )
  }
}

module.exports = ContextMenu
