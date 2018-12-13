const { remote } = require('electron')
const React = require('react')
const ScreenController = require('./ScreenController')

const { addLocaleData, IntlProvider } = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

addLocaleData(enLocaleData)

class App extends React.Component {
  render () {
    const { state } = this.props

    return (
      <IntlProvider locale={window.localeData.locale}>
        <ScreenController
          logins={remote.app.logins}
          saved={state.saved}
          deltachat={state.deltachat} />
      </IntlProvider>
    )
  }
}

module.exports = App
