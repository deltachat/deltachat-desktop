const { ThemeProvider } = require('./Theming')
const React = require('react')
const SettingsContext = require('./contexts/SettingsContext')
const ScreenController = require('./ScreenController')

const { addLocaleData, IntlProvider } = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

addLocaleData(enLocaleData)

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = props.STATE_WRAPPER.state
  }

  render () {
    const { state } = this
    return (
      <SettingsContext.Provider value={state.saved}>
        <IntlProvider locale={window.localeData.locale}>
          <ThemeProvider>
            <ScreenController
              logins={state.logins}
              saved={state.saved}
              deltachat={state.deltachat} />
          </ThemeProvider>
        </IntlProvider>
      </SettingsContext.Provider>
    )
  }
}

module.exports = App
