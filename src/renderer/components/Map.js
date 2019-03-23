const React = require('react')
const mapboxgl = require('mapbox-gl')

class Map extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      points: []
    }
  }

  componentDidMount () {
    const { points } = this.props
    let center = points ? points[0] : [174.7910018, 41.3048126]
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGVsdGFjaGF0IiwiYSI6ImNqc3c1aWczMzBjejY0M28wZmU0a3cwMzMifQ.ZPTH9dFJaav06RAu4rTYHw'
    const map = new mapboxgl.Map(
      {
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: center, // starting position [lng, lat]
        zoom: 12 // starting zoom
      })

    map.on('load', function (cb) {
      console.log('On loaded!')
      if (map.loaded()) {
        var popup = new mapboxgl.Popup({ offset: 25 }).setText('Reported ')
        new mapboxgl.Marker({
          draggable: true
        }).setLngLat(center).setPopup(popup).addTo(map)
      }
    })
  }

  render () {
    return (
      <div id='map' />
    )
  }
}

module.exports = Map
