import { callDcMethod } from '../../ipc'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactDOM from 'react-dom'
const debounce = require('debounce')
import mapboxgl from 'mapbox-gl'
import { locationStore } from '../../stores/locations'
import geojsonExtent from '@mapbox/geojson-extent'
import moment from 'moment'
import formatRelativeTime from '../conversations/formatRelativeTime'
import MapLayerFactory from './MapLayerFactory'
import { Slider, Button, Collapse } from '@blueprintjs/core'
import PopupMessage from './PopupMessage'
import * as SessionStorage from '../helpers/SessionStorage'
import { SettingsContext } from '../../contexts'
import chatStore from '../../stores/chat'

import { state as LocationStoreState } from '../../stores/locations'

import ContextMenu from './ContextMenu'
import {
  FullChat,
  MessageType,
  JsonMessage,
  JsonContact,
  JsonLocations,
} from '../../../shared/shared-types'

type MapData = {
  contact: JsonContact
  pathLayerId: string
  pointsLayerId: string
  hidden: Boolean
  marker?: mapboxgl.Marker
}

type Point = [number, number]

type Contact = JsonContact & { hidden?: boolean }

type MapProps = {
  selectedChat: FullChat
}

export default class MapComponent extends React.Component<
  MapProps,
  {
    timeOffset: number
    mapStyle: 'default' | 'satellite'
    showControls: boolean
    showPathLayer: boolean
    currentContacts: Contact[]
  }
> {
  maxZoomAfterFitBounds = 20
  mapDataStore = new Map<number | string, todo>()
  contextMenu = React.createRef<ContextMenu>()
  contextMenuPopup: mapboxgl.Popup | null = null
  poiLocation: mapboxgl.LngLat | null = null
  refreshLocations: typeof MapComponent.prototype.getLocations = debounce(
    this.getLocations,
    1000
  )
  map: mapboxgl.Map
  currentUserAddress: string
  stateFromSession: boolean
  constructor(props: MapProps) {
    super(props)
    this.state = {
      timeOffset: 50,
      mapStyle: 'default',
      showControls: false,
      showPathLayer: false,
      currentContacts: [],
    }
    this.getLocations = this.getLocations.bind(this)
    this.onLocationsUpdate = this.onLocationsUpdate.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
    this.onMapRightClick = this.onMapRightClick.bind(this)
    this.sendPoiMessage = this.sendPoiMessage.bind(this)
    this.togglePathLayer = this.togglePathLayer.bind(this)
    this.onRangeChange = this.onRangeChange.bind(this)
    this.changeMapStyle = this.changeMapStyle.bind(this)
    this.renderContactCheckbox = this.renderContactCheckbox.bind(this)
  }

  componentDidMount() {
    const { selectedChat } = this.props
    this.currentUserAddress = this.context.credentials.addr
    let mapSettings: { zoom: number; center: mapboxgl.LngLatLike } = {
      zoom: 4,
      center: [8, 48],
    } // <- default
    const savedData = SessionStorage.getItem(
      this.currentUserAddress,
      `${selectedChat.id}_map`
    )
    if (savedData !== undefined) {
      const { savedMapSettings, savedState } = savedData
      mapSettings = savedMapSettings
      this.setState(savedState)
      this.stateFromSession = true
    }
    locationStore.setState({
      selectedChat: selectedChat,
      locations: [],
      mapSettings: {
        timestampFrom: this.getTimestampForRange(),
        timestampTo: 0,
      },
    })
    mapboxgl.accessToken = MapLayerFactory.getAccessToken()
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v11',
      zoom: mapSettings.zoom,
      center: mapSettings.center,
      attributionControl: false,
    })
    this.map.on('load', this.getLocations)
    this.map.on('click', this.onMapClick)
    this.map.on('contextmenu', this.onMapRightClick)
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }))
    locationStore.subscribe(this.onLocationsUpdate)
  }

  componentWillUnmount() {
    // save parts of the state we wanna keep
    const { selectedChat } = this.props
    SessionStorage.storeItem(
      this.currentUserAddress,
      `${selectedChat.id}_map`,
      {
        savedMapSettings: {
          zoom: this.map.getZoom(),
          center: this.map.getCenter(),
        },
        savedState: this.state,
      }
    )
    locationStore.unsubscribe(this.onLocationsUpdate)
  }

  onLocationsUpdate(locationState: LocationStoreState) {
    const { locations } = locationState
    this.renderLayers(locations)
  }

  getLocations() {
    const { selectedChat } = this.props
    const action = {
      type: 'DC_GET_LOCATIONS',
      payload: {
        chatId: selectedChat.id,
        contactId: 0,
        timestampFrom: this.getTimestampForRange(),
        timestampTo: 0,
      },
    }
    locationStore.dispatch(action)
  }

  renderLayers(locations: LocationStoreState['locations']) {
    // remove all layer since source update does not remove existing points
    this.removeAllLayer()
    this.mapDataStore.clear()
    const { selectedChat } = this.props
    let allPoints: Point[] = []
    const currentContacts: JsonContact[] = []
    ;(this.mapDataStore as any).locationCount = locations.length
    if (locations.length > 0) {
      selectedChat.contacts.map(contact => {
        const locationsForContact = locations.filter(
          location =>
            location.contactId === contact.id && !location.isIndependent
        )
        if (locationsForContact.length > 0) {
          currentContacts.push(contact)
        }
        const pointsForLayer = this.renderContactLayer(
          contact,
          locationsForContact
        )
        allPoints = allPoints.concat(pointsForLayer)
      })
      const poiLocations = locations.filter(
        location => location.isIndependent && !location.marker
      )
      if (poiLocations.length > 0) {
        if (!this.map.hasImage('poi-marker')) {
          this.map.loadImage(
            './icons/poi-marker.png',
            (error: any, image: any) => {
              if (!error) {
                this.map.addImage('poi-marker', image)
              }
            }
          )
        }
        const poiLayer = MapLayerFactory.getPOILayer(poiLocations)
        this.mapDataStore.set('poi-layer', poiLayer)
        this.map.addLayer(poiLayer)
      }
      const poiWithMarker = locations.filter(
        location => location.isIndependent && location.marker
      )
      if (poiWithMarker.length) {
        const poiMarker: mapboxgl.Marker[] = []
        poiWithMarker.map(location => {
          var el = document.createElement('div')
          el.className = 'marker-icon'
          el.innerHTML = location.marker
          // make a marker for each feature and add to the map
          const m = new mapboxgl.Marker(el)
            .setLngLat([location.longitude, location.latitude])
            .addTo(this.map)
          ;(m as any).location = location
          poiMarker.push(m)
        })
        this.mapDataStore.set('poi-marker', poiMarker)
      }
      this.setState({ currentContacts: currentContacts })
      if (this.stateFromSession) {
        this.stateFromSession = false
        this.changeMapStyle(this.state.mapStyle)
      } else {
        if (allPoints.length > 0) {
          this.map.fitBounds(
            geojsonExtent({ type: 'Point', coordinates: allPoints }),
            { padding: 100, maxZoom: this.maxZoomAfterFitBounds }
          )
        }
      }
    }
  }

  renderContactLayer(contact: Contact, locationsForContact: JsonLocations) {
    let pointsForLayer: [number, number][] = []
    let lastPoint: todo | null = null
    if (locationsForContact && locationsForContact.length) {
      pointsForLayer = locationsForContact.map(location => {
        if (!lastPoint && !location.isIndependent) {
          lastPoint = location
        }
        return [location.longitude, location.latitude]
      })
      // map data to handle map state
      const mapData: MapData = {
        contact: contact,
        pathLayerId: 'contact-route-' + contact.id,
        pointsLayerId: 'points-' + contact.id,
        hidden: false,
      }
      const existingContact = this.state.currentContacts.find(
        item => item.id === contact.id
      )
      if (existingContact) {
        mapData.hidden = existingContact.hidden
      }
      this.mapDataStore.set(contact.id, mapData)
      this.addOrUpdateLayerForContact(mapData, locationsForContact)

      if (lastPoint) {
        const lastDate = formatRelativeTime(lastPoint.timestamp * 1000, {
          extended: true,
        })
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          this.renderPopupMessage(contact.firstName, lastDate, null)
        )
        if (mapData.marker) {
          // remove old marker
          mapData.marker.remove()
        }
        mapData.marker = new mapboxgl.Marker({
          color: '#' + contact.color.toString(16),
        })
          .setLngLat([lastPoint.longitude, lastPoint.latitude])
          .setPopup(popup)
        if (mapData.hidden) {
          // the contact is hidden so don't show the contact's layers
          this.toggleContactLayer(contact.id, false)
        } else {
          mapData.marker.addTo(this.map)
        }
      }
    }
    return pointsForLayer
  }

  removeAllLayer() {
    if (this.mapDataStore.has('poi-marker')) {
      this.mapDataStore.get('poi-marker').map((m: todo) => m.remove())
      this.mapDataStore.delete('poi-marker')
    }
    if (this.map.getLayer('poi-layer')) {
      this.map.removeLayer('poi-layer')
      this.map.removeSource('poi-layer')
      this.mapDataStore.delete('poi-layer')
    }
    this.mapDataStore.forEach(mapDataItem => {
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
    })
  }

  addOrUpdateLayerForContact(
    mapData: MapData,
    locationsForContact: JsonLocations
  ) {
    if (!this.map.getSource(mapData.pathLayerId)) {
      this.addPathLayer(locationsForContact, mapData)
    } else {
      // update source
      ;(this.map.getSource(mapData.pathLayerId) as todo).setData(
        MapLayerFactory.getGeoJSONLineSourceData(
          locationsForContact.filter(location => !location.isIndependent)
        )
      )
    }
    if (!this.map.getSource(mapData.pointsLayerId)) {
      this.addPathJointsLayer(locationsForContact, mapData)
    } else {
      ;(this.map.getSource(mapData.pointsLayerId) as todo).setData(
        MapLayerFactory.getGeoJSONPointsLayerSourceData(
          locationsForContact,
          mapData.contact,
          true
        )
      )
    }
  }

  addPathLayer(locationsForContact: JsonLocations, mapData: MapData) {
    const source: mapboxgl.GeoJSONSourceRaw = {
      type: 'geojson',
      data: MapLayerFactory.getGeoJSONLineSourceData(
        locationsForContact.filter(location => !location.isIndependent)
      ),
    }
    this.map.addSource(mapData.pathLayerId, source)
    const layer = MapLayerFactory.getGeoJSONLineLayer(
      mapData.pathLayerId,
      mapData.contact.color
    )
    this.map.addLayer(layer)
    if (!this.state.showPathLayer) {
      this.map.setLayoutProperty(mapData.pathLayerId, 'visibility', 'none')
    }
  }

  addPathJointsLayer(locationsForContact: JsonLocations, data: MapData) {
    const source: mapboxgl.GeoJSONSourceRaw = {
      type: 'geojson',
      data: MapLayerFactory.getGeoJSONPointsLayerSourceData(
        locationsForContact,
        data.contact,
        true
      ),
    }
    this.map.addSource(data.pointsLayerId, source)
    const layer = MapLayerFactory.getGeoJSONPointsLayer(
      data.pointsLayerId,
      // data.contact.color
    )
    this.map.addLayer(layer)
  }

  async onMapClick(event: mapboxgl.MapMouseEvent & mapboxgl.EventData) {
    let message: JsonMessage
    const features = this.map.queryRenderedFeatures(event.point)
    const contactFeature = features.find(f => {
      return f.properties.contact !== undefined || f.properties.isPoi
    })
    if (contactFeature) {
      if (contactFeature.properties.msgId) {
        callDcMethod(
          'messageList.getMessage',
          contactFeature.properties.msgId,
          (messageObj: MessageType) => {
            if (messageObj) {
              message = messageObj.msg
            }
            const markup = this.renderPopupMessage(
              contactFeature.properties.contact,
              formatRelativeTime(contactFeature.properties.reported * 1000, {
                extended: true,
              }),
              message
            )
            new mapboxgl.Popup({ offset: [0, -15] })
              .setHTML(markup)
              .setLngLat((contactFeature.geometry as any).coordinates)
              .addTo(this.map)
          }
        )
      }
    }
  }

  onMapRightClick(event: mapboxgl.MapMouseEvent & mapboxgl.EventData) {
    if (this.contextMenuPopup) {
      this.contextMenuPopup.remove()
    }
    this.poiLocation = event.lngLat
    this.contextMenuPopup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(event.lngLat)
      .setDOMContent(ReactDOM.findDOMNode(this.contextMenu.current))
      .addTo(this.map)
      .on('close', () => {
        this.contextMenuPopup = null
        this.poiLocation = null
      })
  }

  sendPoiMessage(message: string) {
    const { selectedChat } = this.props
    if (!this.poiLocation) {
      return
    }
    const latLng = Object.assign({}, this.poiLocation)
    chatStore.dispatch({
      type: 'SEND_MESSAGE',
      payload: [selectedChat.id, message, null, latLng],
    })

    if (this.contextMenuPopup) {
      this.contextMenuPopup.remove()
      this.contextMenuPopup = null
    }

    this.poiLocation = null
  }

  togglePathLayer() {
    this.setState({ showPathLayer: !this.state.showPathLayer })
    const newVisibility = this.state.showPathLayer ? 'none' : 'visible'
    this.mapDataStore.forEach(mapDataItem => {
      if (!mapDataItem.hidden && mapDataItem.contact) {
        this.map.setLayoutProperty(
          mapDataItem.pathLayerId,
          'visibility',
          newVisibility
        )
      }
    })
  }

  onRangeChange(value: number) {
    this.setState({ timeOffset: value })
    this.refreshLocations()
  }

  changeMapStyle(style: 'default' | 'satellite') {
    this.setState({ mapStyle: style })
    const visibility = style === 'satellite' ? 'visible' : 'none'

    if (!this.map.getLayer('satellite')) {
      this.map.addLayer(MapLayerFactory.getSatelliteMapLayer('satellite'))
      // move other layers to top
      this.mapDataStore.forEach(mapDataItem => {
        if (this.map.getLayer(mapDataItem.pathLayerId)) {
          this.map.moveLayer(mapDataItem.pathLayerId)
        }
        if (this.map.getLayer(mapDataItem.pointsLayerId)) {
          this.map.moveLayer(mapDataItem.pointsLayerId)
        }
        if (this.map.getLayer('poi-layer')) {
          this.map.moveLayer('poi-layer')
        }
      })
    }
    this.map.setLayoutProperty('satellite', 'visibility', visibility)
  }

  rangeSliderLabelRenderer(value: number) {
    const rangeMap = MapLayerFactory.getRangeMap()
    return rangeMap[value].label
  }

  getTimestampForRange() {
    const rangeMap = MapLayerFactory.getRangeMap()
    if (rangeMap[this.state.timeOffset].minutes === 0) {
      return 0
    } else {
      return moment().unix() - rangeMap[this.state.timeOffset].minutes * 60
    }
  }

  toggleContactLayer(contactId: number, isHidden: boolean) {
    const mapDataItem = this.mapDataStore.get(contactId)
    const visibility = isHidden ? 'visible' : 'none' // set visibility to...
    if (!isHidden) {
      // layer was not hidden, so hide it now
      if (mapDataItem.marker) {
        mapDataItem.marker.remove()
      }
      mapDataItem.hidden = true
    } else {
      if (mapDataItem.marker) {
        mapDataItem.marker.addTo(this.map)
      }
      mapDataItem.hidden = false
    }
    const currentContacts = this.state.currentContacts.map(contactItem =>
      contactItem.id === contactId
        ? { ...contactItem, ...{ hidden: mapDataItem.hidden } }
        : contactItem
    )
    this.setState({ currentContacts: currentContacts })
    if (this.state.showPathLayer) {
      this.map.setLayoutProperty(
        mapDataItem.pathLayerId,
        'visibility',
        visibility
      )
    }
    this.map.setLayoutProperty(
      mapDataItem.pointsLayerId,
      'visibility',
      visibility
    )
    if (!this.stateFromSession) {
      this.setBoundToMarker()
    }
  }

  setBoundToMarker() {
    const markerCoordinates: Point[] = []
    this.mapDataStore.forEach(mapDataitem => {
      if (mapDataitem.marker && !mapDataitem.hidden) {
        const lngLat = mapDataitem.marker.getLngLat()
        markerCoordinates.push([lngLat.lng, lngLat.lat])
      }
    })
    if (markerCoordinates.length) {
      this.map.fitBounds(
        geojsonExtent({ type: 'Point', coordinates: markerCoordinates }),
        { padding: 100, maxZoom: this.maxZoomAfterFitBounds }
      )
    }
  }

  renderPopupMessage(
    contactName: string,
    formattedDate: string,
    message: JsonMessage
  ) {
    return ReactDOMServer.renderToStaticMarkup(
      <PopupMessage
        username={contactName}
        formattedDate={formattedDate}
        message={message}
      />
    )
  }

  renderContactCheckbox(contact: Contact) {
    return (
      <div key={contact.id}>
        <input
          type='checkbox'
          name={'contact-' + contact.id}
          onChange={() => this.toggleContactLayer(contact.id, contact.hidden)}
          checked={contact.hidden}
        />
        <label style={{ color: '#' + contact.color.toString(16) }}>
          {contact.firstName}{' '}
        </label>
      </div>
    )
  }

  render() {
    return (
      <div>
        <nav id='controls' className='map-overlay top'>
          <Button
            minimal
            className='collapse-control'
            icon={this.state.showControls ? 'chevron-up' : 'chevron-down'}
            onClick={() =>
              this.setState({ showControls: !this.state.showControls })
            }
          >
            Map controls
          </Button>
          <Collapse isOpen={this.state.showControls}>
            <Button
              minimal
              className='toggle-path'
              icon='layout'
              onClick={this.togglePathLayer}
            >
              {this.state.showPathLayer ? 'Hide' : 'Show'} paths
            </Button>
            <div id='menu'>
              <div>
                <input
                  id='default'
                  type='radio'
                  name='rtoggle'
                  value='default'
                  checked={this.state.mapStyle === 'default'}
                  onChange={() => this.changeMapStyle('default')}
                />
                <label htmlFor='streets'>Streets</label>
              </div>
              <div>
                <input
                  id='satellite'
                  type='radio'
                  name='rtoggle'
                  value='satellite'
                  checked={this.state.mapStyle === 'satellite'}
                  onChange={() => this.changeMapStyle('satellite')}
                />
                <label htmlFor='satellite'>Satellite</label>
              </div>
            </div>
            <h3>Time range</h3>
            <Slider
              min={10}
              max={90}
              stepSize={10}
              labelStepSize={10}
              labelRenderer={this.rangeSliderLabelRenderer}
              onChange={this.onRangeChange}
              value={this.state.timeOffset}
              vertical={true}
            />
            <div className='contactFilter'>
              <h3>Hide contacts</h3>
              {this.state.currentContacts.map(this.renderContactCheckbox)}
            </div>
          </Collapse>
        </nav>
        <div id='map' />
        <ContextMenu ref={this.contextMenu} onSetPoi={this.sendPoiMessage} />
      </div>
    )
  }
}

MapComponent.contextType = SettingsContext
