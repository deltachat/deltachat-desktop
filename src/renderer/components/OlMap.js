const React = require('react')
const ol = require('ol')
const TileLayer = require('ol/layer/Tile').default
const OSM = require('ol/source/OSM').default
const { transform } = require('ol/proj')
// const Point = require('ol/geom/Point').default

class OlMap extends React.Component {

  componentDidMount () {
    const { points } = this.props
    let center = points ? points[0] : [174.7910018, 41.3048126]
    let view = new ol.View({
      projection: 'EPSG:3857',
      center: [174.7910018, 41.3048126],
      zoom: 12
    })
    let layer = new TileLayer({ source: new OSM() })
    this.map = new ol.Map({
      layers: [layer],
      target: 'olmap',
      view: view
    })
    view.animate({
      center: transform(center, 'EPSG:4326', 'EPSG:3857'),
      duration: 2000
    }, 500)
  }

  render () {
    return (
      <div id='olmap' />
    )
  }
}

module.exports = OlMap
