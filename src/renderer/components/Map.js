const React = require('react')
const { ipcRenderer } = require('electron')
const mapboxgl = require('mapbox-gl')
const geojsonExtent = require('@mapbox/geojson-extent')
const moment = require('moment')
const MapLayerFactory = require('./helpers/MapLayerFactory')

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      points: []
    }
    this.renderLayer = this.renderLayer.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
  }

  componentDidMount () {
    this.componentDidMount = Date.now()
    console.log('componentDidMount', this.componentDidMount)
    mapboxgl.accessToken = MapLayerFactory.getAccessToken()
    this.map = new mapboxgl.Map(
      {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 12,
        attributionControl: false
      })

    this.map.on('load', this.renderLayer)
    this.map.on('click', this.onMapClick)
  }

  renderLayer () {
    const { selectedChat } = this.props
    const contacts = selectedChat.contacts
    let allPoints = []

    if (this.map.loaded()) {
      console.log('map loaded', this.componentDidMount - Date.now())
      let locationsForChat = ipcRenderer.sendSync('getLocations', selectedChat.id, 0)
      contacts.map(contact => {
        let locationsForContact = locationsForChat.filter(location => location.contactId === contact.id)
        if (locationsForContact && locationsForContact.length) {
          let pointsForLayer = locationsForContact.map(point => [point.lon, point.lat])

          this.map.addLayer(MapLayerFactory.getGeoJSONLineLayer(pointsForLayer, contact))
          this.map.addLayer(MapLayerFactory.getGeoJSONPointsLayer(locationsForContact, contact))

          let lastPoint = locationsForContact[locationsForContact.length - 1]
          let lastDate = moment(lastPoint.tstamp * 1000).format('Y-m-d LT')
          let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(contact.firstName + ' <br />Reported: ' + lastDate)
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

      console.log('map rendered', this.componentDidMount - Date.now())
    }
  }

  onMapClick (event) {
    let features = this.map.queryRenderedFeatures(event.point)
    const contactFeature = features.find(f => f.properties.contact !== undefined)
    if (contactFeature) {
      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(contactFeature.geometry.coordinates)
        .setHTML(contactFeature.properties.contact + '<br />' + contactFeature.properties.reported)
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
