const React = require('react')

class ContextMenu extends React.Component {
  constructor (props) {
    super(props)
    this.poiLabel = React.createRef()
    this.onClick = this.onClick.bind(this)
  }

  onClick () {
    this.props.onSetPoi(this.poiLabel.current.value)
    this.poiLabel.current.value = ''
  }

  render () {
    return (
      <div className={'context-menu'}>
        <div className={'send-button-wrapper'}><button title={'Send POI'} onClick={this.onClick} /></div>
        <label>Send POI</label>
        <input type={'text'} ref={this.poiLabel} placeholder={'Enter label here'} />
      </div>
    )
  }
}

module.exports = ContextMenu
