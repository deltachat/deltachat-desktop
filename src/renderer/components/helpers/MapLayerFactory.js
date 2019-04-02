const formatRelativeTime = require('../conversations/formatRelativeTime')
// todo: get this from some settings/config file
const accessToken = 'pk.eyJ1IjoiZGVsdGFjaGF0IiwiYSI6ImNqc3c1aWczMzBjejY0M28wZmU0a3cwMzMifQ.ZPTH9dFJaav06RAu4rTYHw'

class MapLayerFactory {
  static getGeoJSONLineLayer (points, contact, id) {
    return {
      'id': id,
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': points
          }
        }
      },
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

  static getAccessToken () {
    return accessToken
  }
}

module.exports = MapLayerFactory
