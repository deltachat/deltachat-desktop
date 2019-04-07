const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { ipcRenderer } = require('electron')
const mapboxgl = require('mapbox-gl')
const geojsonExtent = require('@mapbox/geojson-extent')
const moment = require('moment')
const formatRelativeTime = require('./conversations/formatRelativeTime')
const MapLayerFactory = require('./helpers/MapLayerFactory')
const { Slider } = require('@blueprintjs/core')

const PopupMessage = props => <div> {props.username} <br /> {props.formattedDate} </div>

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.timeOffset = 48 // hours
    this.state = {
      points: [],
      timeOffset: 48,
      mapStyle: 'default'
    }
    this.customLayer = {}
    this.renderLayer = this.renderLayer.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
    this.toggleLayer = this.toggleLayer.bind(this)
    this.onRangeChange = this.onRangeChange.bind(this)
    this.changeMapStyle = this.changeMapStyle.bind(this)
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
    this.map.addControl(new mapboxgl.NavigationControl())
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
    console.log(MapLayerFactory.getGeoJSONLineSourceData(coordinates))
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

  toggleLayer (e) {
    const layerIds = Object.keys(this.customLayer)
    const visibility = this.map.getLayoutProperty(layerIds[0], 'visibility')
    const newVisibility = visibility === 'visible' ? 'none' : 'visible'
    layerIds.map(
      layerId => this.map.setLayoutProperty(layerId, 'visibility', newVisibility)
    )
    console.log('toggleLayer: ' + newVisibility)
  }

  onRangeChange (key) {
    return (value) => this.setState({ [key]: value })
  }

  changeMapStyle (evt) {
    // evt.preventDefault()
    // evt.stopPropagation()
    const styleKey = evt.target.value
    this.setState({ mapStyle: styleKey })
    console.log(this.map.getStyle())
    // this.map.setStyle('mapbox://styles/mapbox/' + value)

    if (this.map.getLayer(styleKey)) {
      this.map.setLayoutProperty(styleKey, 'visibility', 'visible')
    } else {
      if (styleKey === 'satellite') {
        this.map.addLayer({
          id: styleKey,
          source: {
            'type': 'raster',
            'tiles': ['https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=' + MapLayerFactory.getAccessToken()],
            'tileSize': 512
          },
          type: 'raster',
          layout: { 'visibility': 'visible' }
        })
      } else if (styleKey === 'terrain') {
        this.map.addSource('dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb'
        })
        this.map.addLayer({
          id: styleKey,
          source: 'dem',
          type: 'hillshade',
          layout: { 'visibility': 'visible' }
        })
      }
    }
    ['satellite', 'terrain'].map(
      style => {
        if (this.map.getLayer(style) && style !== styleKey) {
          this.map.setLayoutProperty(style, 'visibility', 'none')
        }
      }
    )
    Object.keys(this.customLayer).map(
      (key) => {
        this.map.moveLayer(key)
      }
    )
  }

  render () {
    return (
      <div>
        <nav id='controls' className='map-overlay top'>
          <a onClick={this.toggleLayer}>Toggle Path layer</a><br /><br />
          <div id='menu' >
            <form >
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
                <input id='terrain'
                  type='radio'
                  name='rtoggle'
                  value='terrain'
                  checked={this.state.mapStyle === 'terrain'}
                  onChange={this.changeMapStyle} />
                <label htmlFor='terrain'>Terrain</label>
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
            </form>
          </div>
          <br />
          <label id='month'>{this.state.timeOffset} hours</label>
          <Slider min={0}
            max={72}
            stepSize={2}
            labelStepSize={10}
            onChange={this.onRangeChange('timeOffset')}
            value={this.state.timeOffset}
            vertical='true' />
        </nav>
        <div id='map' />
      </div>
    )
  }
}

module.exports = Map
