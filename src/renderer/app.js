const React = require('react')
const ReactDOM = require('react-dom')

const {addLocaleData, IntlProvider} = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

addLocaleData(enLocaleData)

class App extends React.Component {
  render () {
    const locale = navigator.language.slice(0, 2)
    const state = this.props.state
    console.log(state)

    return (
      <IntlProvider locale={locale}>
        <h1>Hello Delta!</h1>
      </IntlProvider>
    )
  }
}


module.exports = App
