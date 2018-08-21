const React = require('react')

const Login = require('./login')
const {addLocaleData, IntlProvider} = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

addLocaleData(enLocaleData)

class App extends React.Component {

  render () {
    const locale = navigator.language.slice(0, 2)
    const state = this.props.state

    return (
      <IntlProvider locale={locale}>
        <Login credentials={state.saved.credentials} />
      </IntlProvider>
    )
  }
}

module.exports = App
