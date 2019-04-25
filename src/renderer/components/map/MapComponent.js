const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { ipcRenderer } = require('electron')
const debounce = require('debounce')
const mapboxgl = require('mapbox-gl')
const geojsonExtent = require('@mapbox/geojson-extent')
const moment = require('moment/moment')
const formatRelativeTime = require('../conversations/formatRelativeTime')
const MapLayerFactory = require('../helpers/MapLayerFactory')
const { Slider, Button, Collapse } = require('@blueprintjs/core/lib/esm/index')
const PopupMessage = require('./PopupMessage')

class MapComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timeOffset: 50,
      lastTimeOffset: 50,
      mapStyle: 'default',
      showTerrain: false,
      showControls: false,
      showPathLayer: false,
      currentContacts: []
    }
    this.mapDataStore = new Map()
    this.debounce = debounce(this.renderOrUpdateLayer, 1000)
    this.renderOrUpdateLayer = this.renderOrUpdateLayer.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
    this.togglePathLayer = this.togglePathLayer.bind(this)
    this.onRangeChange = this.onRangeChange.bind(this)
    this.changeMapStyle = this.changeMapStyle.bind(this)
    this.toggleTerrainLayer = this.toggleTerrainLayer.bind(this)
    this.renderContactCheckbox = this.renderContactCheckbox.bind(this)
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
      }
    )
    this.map.on('load', this.renderOrUpdateLayer)
    this.map.on('click', this.onMapClick)
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }))
  }

  renderOrUpdateLayer () {
    const { selectedChat } = this.props
    const contacts = selectedChat.contacts
    let allPoints = []
    let currentContacts = []
    if (this.state.timeOffset < this.state.lastTimeOffset) {
      // remove all layer since source update does not remove existing points
      this.removeAllLayer()
      this.mapDataStore.clear()
    }
    let locationsForChat = ipcRenderer.sendSync('getLocations', selectedChat.id, 0, this.getTimestampForRange(), 0)
    contacts.map(contact => {
      let locationsForContact = locationsForChat.filter(location => location.contactId === contact.id)
      if (locationsForContact && locationsForContact.length) {
        let pointsForLayer = locationsForContact.map(point => [point.longitude, point.latitude])
        // map data to handle map state
        let mapData = {
          contact: contact,
          pathLayerId: 'contact-route-' + contact.id,
          pointsLayerId: 'points-' + contact.id,
          hidden: false
        }
        const existingContact = this.state.currentContacts.find(item => item.id === contact.id)
        if (existingContact) {
          mapData.hidden = existingContact.hidden
        }
        this.mapDataStore.set(contact.id, mapData)
        this.addLayerForContact(mapData, locationsForContact)

        let lastPoint = locationsForContact[0]
        let lastDate = formatRelativeTime(lastPoint.timestamp * 1000, { extended: true })
        let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(this.renderPopupMessage(contact.firstName, lastDate, null))
        if (mapData.marker) {
          // remove old marker
          mapData.marker.remove()
        }
        mapData.marker = new mapboxgl.Marker({ color: '#' + contact.color.toString(16) })
          .setLngLat([lastPoint.longitude, lastPoint.latitude])
          .setPopup(popup)
        if (mapData.hidden) {
          // the contact is hidden so don't show the contact's layers
          this.toggleContactLayer(contact.id, false)
        } else {
          mapData.marker.addTo(this.map)
        }
        // light weight contact object for component state in contact filter control
        currentContacts.push(
          {
            id: contact.id,
            name: contact.firstName,
            hidden: mapData.hidden,
            color: contact.color
          })
        allPoints = allPoints.concat(pointsForLayer)
      }
    })
    this.setState({ currentContacts: currentContacts })
    if (allPoints.length > 0) {
      this.map.fitBounds(geojsonExtent({ type: 'Point', coordinates: allPoints }), { padding: 100 })
    }
    this.state.lastTimeOffset = this.state.timeOffset
  }

  removeAllLayer () {
    this.mapDataStore.forEach(
      (mapDataItem) => {
        if (this.map.getLayer(mapDataItem.pathLayerId)) {
          this.map.removeLayer(mapDataItem.pathLayerId)
          this.map.removeSource(mapDataItem.pathLayerId)
        }
        if (this.map.getLayer(mapDataItem.pointsLayerId)) {
          this.map.removeLayer(mapDataItem.pointsLayerId)
          this.map.removeSource(mapDataItem.pointsLayerId)
        }
        if (mapDataItem.marker) {
          mapDataItem.marker.remove()
        }
      }
    )
  }

  addLayerForContact (mapData, locationsForContact) {
    if (!this.map.getSource(mapData.pathLayerId)) {
      this.addPathLayer(locationsForContact, mapData)
    } else {
      // update source
      this.map.getSource(mapData.pathLayerId).setData(MapLayerFactory.getGeoJSONLineSourceData(locationsForContact))
    }
    if (!this.map.getSource(mapData.pointsLayerId)) {
      this.addPathJointsLayer(locationsForContact, mapData)
    } else {
      this.map.getSource(mapData.pointsLayerId).setData(MapLayerFactory.getGeoJSONPointsLayerSourceData(locationsForContact, mapData.contact, true))
    }
  }

  addPathLayer (locationsForContact, mapData) {
    let source = { type: 'geojson',
      data: MapLayerFactory.getGeoJSONLineSourceData(locationsForContact)
    }
    this.map.addSource(
      mapData.pathLayerId,
      source
    )
    let layer = MapLayerFactory.getGeoJSONLineLayer(mapData.pathLayerId, mapData.contact.color)
    this.map.addLayer(layer)
    if (!this.state.showPathLayer) {
      this.map.setLayoutProperty(mapData.pathLayerId, 'visibility', 'none')
    }
  }

  addPathJointsLayer (locationsForContact, data) {
    let source = { type: 'geojson',
      data: MapLayerFactory.getGeoJSONPointsLayerSourceData(locationsForContact, data.contact, true)
    }
    this.map.addSource(
      data.pointsLayerId,
      source
    )
    let layer = MapLayerFactory.getGeoJSONPointsLayer(data.pointsLayerId, data.contact.color)
    this.map.addLayer(layer)
  }

  onMapClick (event) {
    const { selectedChat } = this.props
    let message
    let features = this.map.queryRenderedFeatures(event.point)
    const contactFeature = features.find(f => {
      return (f.properties.contact !== undefined)
    })
    if (contactFeature) {
      if (contactFeature.properties.msgId) {
        const messageObj = selectedChat.messages.find(msg => msg.id === contactFeature.properties.msgId)
        if (messageObj) {
          message = messageObj.msg
        }
      }
      let markup = this.renderPopupMessage(contactFeature.properties.contact, contactFeature.properties.reported, message)
      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(contactFeature.geometry.coordinates)
        .setHTML(markup)
        .setLngLat(contactFeature.geometry.coordinates)
        .addTo(this.map)
    }
  }

  togglePathLayer () {
    this.setState({ showPathLayer: !this.state.showPathLayer })
    const newVisibility = this.state.showPathLayer ? 'none' : 'visible'
    this.mapDataStore.forEach(
      (mapDataItem) => {
        this.map.setLayoutProperty(mapDataItem.pathLayerId, 'visibility', newVisibility)
        // this.map.setLayoutProperty(mapDataItem.pointsLayerId, 'visibility', newVisibility)
      }
    )
  }

  onRangeChange (value) {
    this.setState({ 'timeOffset': value })
    this.debounce(value)
  }

  changeMapStyle (style) {
    this.setState({ mapStyle: style })
    const visibility = (style === 'satellite') ? 'visible' : 'none'

    if (!this.map.getLayer('satellite')) {
      this.map.addLayer(MapLayerFactory.getSatelliteMapLayer('satellite'))
      // move other layers to top
      this.mapDataStore.forEach(
        (mapDataItem) => {
          if (this.map.getLayer(mapDataItem.pathLayerId)) {
            this.map.moveLayer(mapDataItem.pathLayerId)
          }
          if (this.map.getLayer(mapDataItem.pointsLayerId)) {
            this.map.moveLayer(mapDataItem.pointsLayerId)
          }
        }
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

  getTimestampForRange () {
    const rangeMap = MapLayerFactory.getRangeMap()
    return moment().unix() - rangeMap[this.state.timeOffset].minutes * 60
  }

  toggleContactLayer (contactId, isHidden) {
    let mapDataItem = this.mapDataStore.get(contactId)
    const visibility = isHidden ? 'visible' : 'none'
    if (!isHidden) {
      mapDataItem.marker.remove()
      mapDataItem.hidden = true
    } else {
      mapDataItem.marker.addTo(this.map)
      mapDataItem.hidden = false
    }
    let currentContacts = this.state.currentContacts.map(
      contactItem => contactItem.id === contactId ? { ...contactItem, ...{ hidden: mapDataItem.hidden } } : contactItem)
    this.setState({ currentContacts: currentContacts })
    this.map.setLayoutProperty(mapDataItem.pathLayerId, 'visibility', visibility)
    this.map.setLayoutProperty(mapDataItem.pointsLayerId, 'visibility', visibility)
    this.setBoundToMarker()
  }

  setBoundToMarker () {
    let markerCoordinates = []
    this.mapDataStore.forEach(
      mapDataitem => {
        if (mapDataitem.marker && !mapDataitem.hidden) {
          const lngLat = mapDataitem.marker.getLngLat()
          markerCoordinates.push([lngLat.lng, lngLat.lat])
        }
      }
    )
    if (markerCoordinates.length) {
      this.map.fitBounds(geojsonExtent({ type: 'Point', coordinates: markerCoordinates }), { padding: 100 })
    }
  }

  renderPopupMessage (contactName, timestamp, message) {
    const i18n = window.translate
    return ReactDOMServer.renderToStaticMarkup(
      <PopupMessage username={contactName} timestamp={timestamp} message={message} i18n={i18n} />
    )
  }

  renderContactCheckbox (contact) {
    return (
      <div key={contact.id} >
        <input type='checkbox' name={contact.id} onChange={() => this.toggleContactLayer(contact.id, contact.hidden)} checked={!contact.hidden} />
        <label style={{ color: '#' + contact.color.toString(16) }}>{contact.name} </label>
      </div>
    )
  }

  render () {
    return (
      <div>
        <nav id='controls' className='map-overlay top'>
          <Button minimal className='collapse-control' icon={this.state.showControls ? 'chevron-up' : 'chevron-down'} onClick={() => this.setState({ showControls: !this.state.showControls })}>Map controls</Button>
          <Collapse isOpen={this.state.showControls}>
            <Button minimal className='toggle-path' icon='layout' onClick={this.togglePathLayer} > {this.state.showPathLayer ? 'Hide' : 'Show'} paths </Button>
            <br />
            <div id='menu' >
              <div>
                <input id='default'
                  type='radio'
                  name='rtoggle'
                  value='default'
                  checked={this.state.mapStyle === 'default'}
                  onChange={() => this.changeMapStyle('default')} />
                <label htmlFor='streets'>Streets</label>
              </div>
              <div>
                <input id='satellite'
                  type='radio'
                  name='rtoggle'
                  value='satellite'
                  checked={this.state.mapStyle === 'satellite'}
                  onChange={() => this.changeMapStyle('satellite')} />
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
            <h3>Time range</h3>
            <Slider min={10}
              max={90}
              stepSize={10}
              labelStepSize={10}
              labelRenderer={this.rangeSliderLabelRenderer}
              onChange={this.onRangeChange}
              value={this.state.timeOffset}
              vertical='true' />
            <div className='contactFilter'>
              <h3>Hide contacts</h3>
              {this.state.currentContacts.map(this.renderContactCheckbox)}
            </div>
          </Collapse>
        </nav>
        <div id='map' />
      </div>
    )
  }
}

module.exports = MapComponent
