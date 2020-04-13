import React from 'react'
import MapComponent from './MapComponent'

type ContextMenuProps = {
  onSetPoi: MapComponent['sendPoiMessage']
}

export default class ContextMenu extends React.Component<ContextMenuProps> {
  poiLabel = React.createRef<HTMLInputElement>()
  constructor(props: ContextMenuProps) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  onClick() {
    this.props.onSetPoi(this.poiLabel.current.value)
    this.poiLabel.current.value = ''
  }

  render() {
    return (
      <div className={'context-menu'}>
        <div className={'send-button-wrapper'}>
          <button title={'Send POI'} onClick={this.onClick} />
        </div>
        <label>Send POI</label>
        <input
          type={'text'}
          ref={this.poiLabel}
          placeholder={'Enter label here'}
        />
      </div>
    )
  }
}
