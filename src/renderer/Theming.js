const styled = require('styled-components').default
const React = require('react')
const StyledThemeProvider = require('styled-components').ThemeProvider
const { EventEmitter } = require('events')
var Color = require('color')

const defaultTheme = Object.freeze({
  deltaPrimaryBg: '#415e6b',
  deltaPrimaryBgLight: '#4c6e7d',
  deltaPrimaryFg: '#ffffff',
  deltaPrimaryFgLight: '#d0d0d0',
  deltaHover: '#ececec',
  deltaChatPrimaryFg: '#070c14',
  deltaChatPrimaryFgLight: '#62656a',
  deltaChatMessageBubbleSelf: '#efffde',
  deltaChatMessageBubbleOther: '#ffffff',
  deltaInfoMessageBubbleBg: '#000000',
  deltaInfoMessageBubbleColor: 'white',
  deltaChatMessageBubbleSelfStatusColor: '#4caf50',
  deltaFocusBlue: '#42A5F5',
  deltaSelected: '#4c6e7d', // same as deltaPrimaryBgLight
  // Scss ones
  signalBlue: '#2090ea',
  coreRed: '#f44336',
  colorWhite: '#ffffff',
  colorLight90: '#070c14',
  colorLight35: '#a4a6a9',
  colorLight60: '#62656a',
  colorBlue: '#2090ea',
  colorGrey: '#616161',
  converstationGrey: '#505050',
  outgoingMessagePadlock: '#4caf50',
  contextMenuBorder: '#efefef',
  contextMenuBG: '#f9fafa',
  messageButtons: '#8b8e91',
  messageButtonsHover: '#070c14',
  bgColor: '#fff'
})

class ThemeManager extends EventEmitter {
  constructor () {
    super()
    const themeJSON = window.localStorage.getItem('theme')
    this.currentTheme = themeJSON !== null ? JSON.parse(themeJSON) : {}

    window.ThemeManager = this // only for using fron the dev console
  }

  setTheme (theme) {
    window.localStorage.setItem('theme', JSON.stringify(theme))
    this.currentTheme = theme
    this.emit('update')
  }

  getCurrentTheme () {
    return Object.assign({}, defaultTheme, this.currentTheme)
  }
}

const manager = new ThemeManager()

const ScssVarOverwrite = styled.div`
--color-signal-blue: ${props => props.theme.signalBlue};
--color-core-red: ${props => props.theme.coreRed};

--color-white: ${props => props.theme.colorWhite};
--color-white-07: ${props => Color(props.theme.colorWhite).alpha(0.7).toString()};
--color-light-90: ${props => props.theme.colorLight90};
--color-light-35: ${props => props.theme.colorLight35};
--color-light-60: ${props => props.theme.colorLight60};
--color-blue: ${props => props.theme.colorBlue};
--color-grey: ${props => props.theme.colorGrey};

--color-conversation-grey: ${props => props.theme.converstationGrey};

// Already renamed
--outgoing-message-padlock: ${props => props.theme.outgoingMessagePadlock};
--context-menu-border: ${props => props.theme.contextMenuBorder};
--context-menu-bg: ${props => props.theme.contextMenuBG};
--message-buttons: ${props => props.theme.messageButtons};
--message-buttons-hover: ${props => props.theme.messageButtonsHover};
--bg-color: ${props => props.theme.bgColor};
`

class ThemeProvider extends React.Component {
  constructor () {
    super()
    this.state = {
      theme: manager.getCurrentTheme()
    }
    this.update = this.update.bind(this)
  }

  componentDidMount () {
    manager.addListener('update', this.update)
  }

  componentWillUnmount () {
    manager.removeListener('update', this.update)
  }

  update (ev) {
    console.log(ev)
    this.setState({ theme: manager.getCurrentTheme() })
  }

  render () {
    return <StyledThemeProvider theme={this.state.theme}>
      <ScssVarOverwrite>
        {this.props.children}
      </ScssVarOverwrite>
    </StyledThemeProvider>
  }
}

module.exports = {
  defaultTheme,
  manager,
  ThemeProvider
}
