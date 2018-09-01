const React = require('react')

const Login = require('./components/Login')
const ScreenController = require('./ScreenController')

const { addLocaleData, IntlProvider } = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

addLocaleData(enLocaleData)

class App extends React.Component {
  render () {
    const { state } = this.props
    const deltachat = state.deltachat
    const Screen = deltachat.ready
      ? <ScreenController deltachat={state.deltachat} />
      : <Login credentials={state.saved.credentials} />

    return (
      <IntlProvider locale={window.localeData.locale}>
        {Screen}
      </IntlProvider>
    )
  }
}

module.exports = App
