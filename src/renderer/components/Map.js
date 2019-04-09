const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { ipcRenderer } = require('electron')
const mapboxgl = require('mapbox-gl')
const geojsonExtent = require('@mapbox/geojson-extent')
const moment = require('moment')
const formatRelativeTime = require('./conversations/formatRelativeTime')
const MapLayerFactory = require('./helpers/MapLayerFactory')
const { Slider, Button, Collapse } = require('@blueprintjs/core')

const PopupMessage = props => <div> {props.username} <br /> {props.formattedDate} </div>

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.timeOffset = 10
    this.state = {
      points: [],
      timeOffset: 10,
      mapStyle: 'default',
      showTerrain: false,
      showControls: false,
      showPaths: true
    }
    this.customLayer = {}
    this.renderLayer = this.renderLayer.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
    this.toggleLayer = this.toggleLayer.bind(this)
    this.onRangeChange = this.onRangeChange.bind(this)
    this.changeMapStyle = this.changeMapStyle.bind(this)
    this.toggleTerrainLayer = this.toggleTerrainLayer.bind(this)
  }

  componentDidMount () {
    this.componentDidMount = Date.now()
    mapboxgl.accessToken = MapLayerFactory.getAccessToken()
    this.map = new mapboxgl.Map(
      {
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        zoom: 4,
        center: [8, 48],
        attributionControl: false
      })
    this.map.on('load', this.renderLayer)
    this.map.on('click', this.onMapClick)
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }))
  }

  renderLayer () {
    const { selectedChat } = this.props
    const contacts = selectedChat.contacts
    let allPoints = []

    let locationsForChat = ipcRenderer.sendSync('getLocations', selectedChat.id, 0, moment().unix() - (this.initialTimeOffset * 3600), 0)
    contacts.map(contact => {
      let locationsForContact = locationsForChat.filter(location => location.contactId === contact.id)
      if (locationsForContact && locationsForContact.length) {
        let pointsForLayer = locationsForContact.map(point => [point.lon, point.lat])
        let pathLayerId = 'contact-route-' + contact.id
        let pointsLayerId = 'points-' + contact.id
        this.addPathLayer(pointsForLayer, contact, pathLayerId)
        // this.map.addLayer(MapLayerFactory.getGeoJSONLineLayer(contact, pathLayerId))
        this.map.addLayer(MapLayerFactory.getGeoJSONPointsLayer(locationsForContact, contact, pointsLayerId))
        let lastPoint = locationsForContact[locationsForContact.length - 1]
        let lastDate = formatRelativeTime(lastPoint.tstamp * 1000, { extended: true })
        let markup = ReactDOMServer.renderToStaticMarkup(<PopupMessage username={contact.firstName} formattedDate={lastDate} />)
        let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(markup)
        new mapboxgl.Marker({ color: '#' + contact.color.toString(16) })
          .setLngLat([lastPoint.lon, lastPoint.lat])
          .setPopup(popup)
          .addTo(this.map)
        allPoints = allPoints.concat(pointsForLayer)
      }
    })
    if (allPoints.length > 0) {
      this.map.fitBounds(geojsonExtent({ type: 'Point', coordinates: allPoints }), { padding: 100 })
    }
  }

  addPathLayer (coordinates, contact, layerId) {
    let source = { type: 'geojson',
      data: MapLayerFactory.getGeoJSONLineSourceData(coordinates)
    }
    this.map.addSource(
      layerId,
      source
    )
    let layer = MapLayerFactory.getGeoJSONLineLayer(contact, layerId)
    this.customLayer[layerId] = layer
    this.map.addLayer(layer)
  }

  onMapClick (event) {
    let features = this.map.queryRenderedFeatures(event.point)
    const contactFeature = features.find(f => f.properties.contact !== undefined)
    if (contactFeature) {
      let markup = ReactDOMServer.renderToStaticMarkup(<PopupMessage username={contactFeature.properties.contact} formattedDate={contactFeature.properties.reported} />)
      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(contactFeature.geometry.coordinates)
        .setHTML(markup)
        .setLngLat(contactFeature.geometry.coordinates)
        .addTo(this.map)
    }
  }

  toggleLayer () {
    this.setState({ showPaths: !this.state.showPaths })
    const layerIds = Object.keys(this.customLayer)
    const newVisibility = this.state.showPaths ? 'none' : 'visible'
    layerIds.map(
      layerId => this.map.setLayoutProperty(layerId, 'visibility', newVisibility)
    )
  }

  onRangeChange (key) { // TODO
    return (value) => this.setState({ [key]: value })
  }

  changeMapStyle (evt) {
    const style = evt.target.value
    this.setState({ mapStyle: style })
    const visibility = (style === 'satellite') ? 'visible' : 'none'

    if (!this.map.getLayer('satellite')) {
      this.map.addLayer(MapLayerFactory.getSatelliteMapLayer('satellite'))
      // move other layers to top
      Object.keys(this.customLayer).map(
        key => this.map.moveLayer(key)
      )
    }
    this.map.setLayoutProperty('satellite', 'visibility', visibility)
  }

  toggleTerrainLayer () {
    let { showTerrain } = this.state
    this.setState({ showTerrain: !showTerrain })
    const visibility = showTerrain ? 'none' : 'visible'
    if (this.map.getLayer('terrain')) {
      this.map.setLayoutProperty('terrain', 'visibility', visibility)
    } else {
      this.map.addSource('dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb'
      })
      this.map.addLayer({
        id: 'terrain',
        source: 'dem',
        type: 'hillshade',
        layout: { 'visibility': 'visible' }
      })
    }
  }

  rangeSliderLabelRenderer (value) {
    const rangeMap = MapLayerFactory.getRangeMap()
    return rangeMap[value].label
  }

  render () {
    return (
      <div>
        <nav id='controls' className='map-overlay top'>
          <Button minimal icon={this.state.showControls ? 'chevron-up' : 'chevron-down'} onClick={() => this.setState({ showControls: !this.state.showControls })}>Map controls</Button>
          <Collapse isOpen={this.state.showControls}>
            <Button minimal icon='layout' onClick={this.toggleLayer} > {this.state.showPaths ? 'Hide' : 'Show'} paths </Button>
            <br />
            <div id='menu' >
              <div>
                <input id='default'
                  type='radio'
                  name='rtoggle'
                  value='default'
                  checked={this.state.mapStyle === 'default'}
                  onChange={this.changeMapStyle} />
                <label htmlFor='streets'>Streets</label>
              </div>
              <div>
                <input id='satellite'
                  type='radio'
                  name='rtoggle'
                  value='satellite'
                  checked={this.state.mapStyle === 'satellite'}
                  onChange={this.changeMapStyle} />
                <label htmlFor='satellite'>Satellite</label>
              </div>
              <div>
                <input id='terrain'
                  type='checkbox'
                  name='rtoggle'
                  value='terrain'
                  checked={this.state.showTerrain}
                  onChange={this.toggleTerrainLayer} />
                <label htmlFor='terrain'>Terrain</label>
              </div>
            </div>
            <label className='divider'>Time range</label>
            <Slider min={10}
              max={90}
              stepSize={10}
              labelStepSize={10}
              labelRenderer={this.rangeSliderLabelRenderer}
              onChange={this.onRangeChange('timeOffset')}
              value={this.state.timeOffset}
              vertical='true' />
          </Collapse>
        </nav>
        <div id='map' />
      </div>
    )
  }
}

module.exports = Map
