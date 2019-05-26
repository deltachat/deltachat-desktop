const React = require('react')
const styled = require('styled-components').default
const SearchInput = require('./SearchInput')

const ListDiv = styled.div`
  max-height: 400px;
  overflow: scroll;
  margin-top: 10px;
  border: 1px solid darkgrey;
`

class SearchableList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      queryStr: ''
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
  }

  handleSearch (event) {
    this.search(event.target.value)
  }

  search (queryStr) {
    this.setState({ queryStr })
  }

  componentDidMount () {
    this.search('')
  }
  // can be overwritten by child class
  _getData () {
    return this.props.data
  }
  // can be overwritten by child class
  _filter (value, index, array) {
    return this.props.filterFunction ? this.props.filterFunction(value, index, array) : true
  }
  // should be overwritten by child class
  renderItem (item, index, array) {
    return <div>
      {JSON.stringify(item)}<br />
    </div>
  }

  render (renderFunction) {
    const data = this._getData().filter(this._filter.bind(this))
    return <div>
      <SearchInput
        onChange={this.handleSearch}
        value={this.state.queryStr}
      />
      <ListDiv>
        {data.map(this.renderItem.bind(this))}
      </ListDiv>
    </div>
  }
}
module.exports = SearchableList
