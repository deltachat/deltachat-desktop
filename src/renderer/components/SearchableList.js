const React = require('react')
const styled = require('styled-components').default
const SearchInput = require('./SearchInput')
const debounce = require('debounce')

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
      queryStr: '',
      data: []
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
    this.updateQuery = debounce(this.search, 200)
  }

  handleSearch (event) {
    this.updateQuery(event.target.value)
    this.setState({ queryStr: event.target.value })
  }

  // could be overwritten by child class
  search (queryStr) {
    this.setState({ queryStr })
  }

  componentDidMount () {
    this.search('')
  }

  // should be overwritten by child class
  renderItem (item, index, array) {
    return <div>
      {JSON.stringify(item)}<br />
    </div>
  }

  render (renderFunction) {
    const { data } = this.state
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
