const React = require('react')
const { ipcRenderer } = require('electron')
const mapboxgl = require('mapbox-gl')
const moment = require('moment')
const MapLayerFactory = require('./helpers/MapLayerFactory')

class Map extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      points: []
    }
    this.renderMap = this.renderMap.bind(this)
  }

  componentDidMount () {
    this.componentDidMount = Date.now()
    console.log('componentDidMount', Date.now())
    mapboxgl.accessToken = MapLayerFactory.getAccessToken()
    this.map = new mapboxgl.Map(
      {
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        zoom: 12 // starting zoom
      })

    this.map.on('load', this.renderMap)
  }

  renderMap () {
    const { selectedChat } = this.props
    const contacts = selectedChat.contacts

    if (this.map.loaded()) {
      console.log('map loaded', this.componentDidMount - Date.now())
      let allPoints = []
      let center = null
      contacts.map(contact => {
        let locationsForContact = ipcRenderer.sendSync('getLocations', selectedChat.id, contact.id)
        if (locationsForContact && locationsForContact.length) {
          let pointsForLayer = []
          locationsForContact.map(point => pointsForLayer.push([point.lon, point.lat]))

          this.map.addLayer(MapLayerFactory.getGeoJSONLineLayer(pointsForLayer, contact))
          this.map.addLayer(MapLayerFactory.getGeoJSONPointsLayer(locationsForContact, contact))

          let lastPoint = locationsForContact[locationsForContact.length - 1]
          let lastDate = moment(lastPoint.tstamp * 1000).format('Y-m-d LT')
          let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(contact.firstName + ' <br />Reported: ' + lastDate)
          new mapboxgl.Marker({ color: '#' + contact.color.toString(16) })
            .setLngLat([lastPoint.lon, lastPoint.lat])
            .setPopup(popup)
            .addTo(this.map)

          allPoints = allPoints.concat(pointsForLayer) // needed for bounds
          center = [lastPoint.lon, lastPoint.lat]
        }
      })
      this.map.setCenter(center)

      let bounds = new mapboxgl.LngLatBounds(allPoints)
      this.map.fitBounds(bounds, { padding: 200 })

      this.map.on('click', e => {
        let features = this.map.queryRenderedFeatures(e.point)
        const contactFeature = features.find(f => f.properties.contact !== undefined)
        console.log(contactFeature)
        if (contactFeature) {
          new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(contactFeature.geometry.coordinates)
            .setHTML(contactFeature.properties.contact + '<br />' + contactFeature.properties.reported)
            .setLngLat(contactFeature.geometry.coordinates)
            .addTo(this.map)
        }
      })
      console.log('map rendered', this.componentDidMount - Date.now())
    }
  }

  render () {
    return (
      <div id='map' />
    )
  }
}

module.exports = Map
