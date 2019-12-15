// todo: get this from some settings/config file
const accessToken = 'pk.eyJ1IjoiZGVsdGFjaGF0IiwiYSI6ImNqc3c1aWczMzBjejY0M28wZmU0a3cwMzMifQ.ZPTH9dFJaav06RAu4rTYHw'

class MapLayerFactory {
  static getGeoJSONLineSourceData (locations) {
    const coordinates = locations.map(point => [point.longitude, point.latitude])
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }]
    }
  }

  static getGeoJSONLineLayer (pathLayerId, color) {
    return {
      id: pathLayerId,
      type: 'line',
      source: pathLayerId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#' + color.toString(16),
        'line-opacity': 0.7,
        'line-width': 4
      }
    }
  }

  static getGeoJSONPointsLayer (pointsLayerId, color) {
    return {
      id: pointsLayerId,
      type: 'symbol',
      layout: {
        'icon-image': '{icon}-15',
        'icon-size': 2
      },
      source: pointsLayerId
    }
  }

  static getGeoJSONPointsLayerSourceData (locations, contact, withMessageOnly) {
    return {
      type: 'FeatureCollection',
      features: locations.reduce((features, location) => {
        if (!withMessageOnly || location.msgId) {
          const icon = location.isIndependent ? 'viewpoint' : 'marker'
          features.push({
            type: 'Feature',
            properties: {
              contact: contact.firstName,
              reported: location.timestamp,
              isPoi: location.isIndependent,
              msgId: location.msgId,
              icon: icon
            },
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          })
        }
        return features
      }, [])
    }
  }

  static getPOILayer (locations) {
    const layer = {
      id: 'poi-layer',
      type: 'symbol',
      /* Source: A data source specifies the geographic coordinate where the image marker gets placed. */
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      },
      layout: {
        'icon-image': 'poi-marker'
      }
    }
    locations.map(
      (location) => {
        layer.source.data.features.push(
          {
            type: 'Feature',
            properties: {
              reported: location.timestamp,
              isPoi: true,
              msgId: location.msgId
            },
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            }
          }
        )
      }
    )
    return layer
  }

  static getSatelliteMapLayer (styleKey) {
    return {
      id: styleKey,
      source: {
        type: 'raster',
        tiles: ['https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=' + accessToken],
        tileSize: 512
      },
      type: 'raster',
      layout: { visibility: 'visible' }
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
