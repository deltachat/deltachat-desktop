const React = require('react')

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
    const locale = navigator.language.slice(0, 2)
    const state = this.props.state
    const deltachat = state.deltachat

    return (
      <IntlProvider locale={locale}>
        <div>
          { !deltachat.ready && <Login credentials={state.saved.credentials} /> }
          { deltachat.ready && <Home deltachat={state.deltachat} /> }
        </div>
      </IntlProvider>
    )
  }
}

module.exports = App
