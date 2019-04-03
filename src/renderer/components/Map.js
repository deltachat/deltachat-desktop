const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { ipcRenderer } = require('electron')
const mapboxgl = require('mapbox-gl')
const geojsonExtent = require('@mapbox/geojson-extent')
const moment = require('moment')
const formatRelativeTime = require('./conversations/formatRelativeTime')
const MapLayerFactory = require('./helpers/MapLayerFactory')

const PopupMessage = props => <div> {props.username} <br /> {props.formattedDate} </div>

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      points: []
    }
    this.initialTimeOffset = 48 // hours
    this.renderLayer = this.renderLayer.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
  }

  componentDidMount () {
    this.componentDidMount = Date.now()
    mapboxgl.accessToken = MapLayerFactory.getAccessToken()
    this.map = new mapboxgl.Map(
      {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v8',
        zoom: 4,
        center: [8, 48],
        attributionControl: false
      })
    this.map.on('load', this.renderLayer)
    this.map.on('click', this.onMapClick)
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
        this.map.addLayer(MapLayerFactory.getGeoJSONLineLayer(pointsForLayer, contact))
        this.map.addLayer(MapLayerFactory.getGeoJSONPointsLayer(locationsForContact, contact))

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

  render () {
    return (
      <div id='map' />
    )
  }
}

module.exports = Map
