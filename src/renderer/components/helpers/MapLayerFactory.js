const formatRelativeTime = require('../conversations/formatRelativeTime')
// todo: get this from some settings/config file
const accessToken = 'pk.eyJ1IjoiZGVsdGFjaGF0IiwiYSI6ImNqc3c1aWczMzBjejY0M28wZmU0a3cwMzMifQ.ZPTH9dFJaav06RAu4rTYHw'

class MapLayerFactory {
  static getGeoJSONLineSourceData (coordinates) {
    return {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      }]
    }
  }

  static getGeoJSONLineLayer (contact, id) {
    return {
      'id': id,
      'type': 'line',
      'source': id,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#' + contact.color.toString(16),
        'line-opacity': 0.7,
        'line-width': 4
      }
    }
  }

  static getGeoJSONPointsLayer (locations, contact, layerId) {
    let layer = {
      'id': layerId,
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': []
        }
      },
      paint: {
        'circle-radius': 6,
        'circle-color': '#' + contact.color.toString(16)
      }
    }
    locations.map(location => {
      layer.source.data.features.push({
        'type': 'Feature',
        'properties': {
          contact: contact.firstName,
          reported: formatRelativeTime(location.tstamp * 1000, { extended: true })
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [location.lon, location.lat]
        }
      })
    })
    return layer
  }

  static getGeoJSONPointsLayerSource (locations, contact) {
    return locations.map(location => {
      return {
        'type': 'Feature',
        'properties': {
          contact: contact.firstName,
          reported: formatRelativeTime(location.tstamp * 1000, { extended: true })
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [location.lon, location.lat]
        }
      }
    })
  }

  static getSatelliteMapLayer (styleKey) {
    return {
      id: styleKey,
      source: {
        'type': 'raster',
        'tiles': ['https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=' + accessToken],
        'tileSize': 512
      },
      type: 'raster',
      layout: { 'visibility': 'visible' }
    }
  }

  static getRangeMap () {
    return {
      10: { minutes: 30, label: '30 min' },
      20: { minutes: 60, label: '1 h' },
      30: { minutes: 120, label: '2 h' },
      40: { minutes: 480, label: '8 h' },
      50: { minutes: (24 * 60), label: '1 day' },
      60: { minutes: (2 * 24 * 60), label: '2 day' },
      70: { minutes: (8 * 24 * 60), label: '1 week' },
      80: { minutes: (32 * 24 * 60), label: '4 weeks' },
      90: { minutes: 0, label: 'unlimited' }
    }
  }

  static getAccessToken () {
    return accessToken
  }
}

module.exports = MapLayerFactory
