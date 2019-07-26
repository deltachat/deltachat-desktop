const styled = require('styled-components').default
var Color = require('color')

export function ThemeDataBuilder (theme) {
  // todo resolve all strings to be dependent on vars of the highLevelObject
  // Its ok when highLevelObject is missing some properties
  // and the returned object misses some values as result,
  // because it gets merged with the default theme later anyway

  // #070c14; // some kind of font color?
  let themeData = {
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
    bgColor: '#fff',
    // Misc
    ovalButtonBg: '#415e6b',
    ovalButtonBgHover: '#ececec',
    ovalButtonText: 'white',
    ovalButtonTextHover: '#415e6b',
    // Dings
    navBarBackground: '#415e6b',
    navBarText: '#ffffff',
    navBarSearchPlaceholder: '#d0d0d0',
    navBarGroupSubtitle: '#d0d0d0',
    chatViewWrapperBg: 'white', // Is this used??
    chatViewBg: '#e6dcd3',
    chatViewBgImgPath: theme.bgImagePath,
    composerText: '#415e6b',
    composerBg: 'white',
    chatListItemSelectedBg: '#4c6e7d',
    chatListItemSelectedBgHover: Color('#4c6e7d').lighten(0.24).hex(), // deltaSelected, but should be something else
    chatListItemSelectedText: 'white',
    chatListItemBgHover: '#ececec',
    // Message Bubble
    messageText: '#070c14',
    infoMessageBubbleBg: '#000000',
    infoMessageBubbleText: 'white',
    messageIncommingBg: '#ffffff',
    messageIncommingDate: '#070c14',
    messageOutgoingBg: '#efffde',
    messageOutgoingStatusColor: '#4caf50',
    // Message Bubble - Buttons
    messageButtons: '#8b8e91',
    messageButtonsHover: '#070c14',
    // Login Screen
    loginInputFocusColor: '#42A5F5',
    deltaChatPrimaryFg: '#070c14', // only used on login screen
    deltaChatPrimaryFgLight: '#62656a' // only used on login screen
  }
  Object.keys(themeData).forEach(key => themeData[key] === undefined ? delete themeData[key] : '')
  if (theme.raw) {
    themeData = Object.assign(themeData, theme.raw)
    console.log('theme.raw', theme.raw, themeData)
  }
  return themeData
}

export const defaultTheme = Object.freeze({
  bgImagePath: '../images/background_hd2.svg'
})

export const defaultThemeData = Object.freeze(ThemeDataBuilder(defaultTheme))

export const ScssVarOverwrite = styled.div`
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
