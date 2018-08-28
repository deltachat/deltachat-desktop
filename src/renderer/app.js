const React = require('react')
const {ipcRenderer} = require('electron')

const Login = require('./login')
const Home = require('./home')

// const Stars = require('./stars')
// const Status = require('./status')
// const Chats = require('./chats')

const {addLocaleData, IntlProvider} = require('react-intl')
const enLocaleData = require('react-intl/locale-data/en')

addLocaleData(enLocaleData)

class App extends React.Component {
  render () {
    const {state} = this.props
    const deltachat = state.deltachat

    return (
      <IntlProvider locale={window.localeData.locale}>
        <div>
          { !deltachat.ready && <Login credentials={state.saved.credentials} /> }
          { deltachat.ready && <Home deltachat={state.deltachat} /> }
        </div>
      </IntlProvider>
    )
  }
}

module.exports = App
