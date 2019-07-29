var Color = require('color')

function changeContrast (colorString, factor) {
  // TODO make the black check code work
  const color = Color(colorString).hex() === '#000000' ? Color('#010101') : Color(colorString)
  if (color.isDark()) {
    console.log('dark')
    return color.lighten(factor).rgb().string()
  } else if (color.isLight()) {
    console.log('light')
    return color.darken(factor).rgb().string()
  }
}

function invertColor (colorString) {
  const color = Color(colorString)
  return color.negate().rgb().string()
}

function changeSaturation (colorString, factor) {
  const color = Color(colorString)
  if (factor < 0) {
    return color.desaturate(factor *= -1).rgb().string()
  } else if (factor > 0) {
    return color.saturate(factor).rgb().string()
  } else {
    return color.rgb().string()
  }
}

function undefinedGuard (value, func) {
  if (typeof value === 'undefined') return undefined
  else return func(value)
}

export function ThemeDataBuilder (theme) {
  // todo resolve all strings to be dependent on vars of the highLevelObject
  // Its ok when highLevelObject is missing some properties
  // and the returned object misses some values as result,
  // because it gets merged with the default theme later anyway
  /// Don't use color directly here
  console.log(theme.textNavBar, changeContrast(theme.textNavBar, 0.3))

  // #070c14; // some kind of font color?
  let themeData = {
    // Misc
    ovalButtonBg: theme.ovalButtonBg,
    ovalButtonBgHover: undefinedGuard(
      theme.ovalButtonBg, c => changeContrast(c, 0.7)
    ),
    ovalButtonText: theme.ovalButtonText,
    ovalButtonTextHover: undefinedGuard(
      theme.ovalButtonText, c => changeSaturation(invertColor(c), -1)
    ),
    // NavBar
    navBarBackground: theme.bgNavBar,
    navBarText: theme.textNavBar,
    navBarSearchPlaceholder: undefinedGuard(
      theme.textNavBar, c => changeContrast(c, 0.27) // '#d0d0d0',
    ),
    navBarGroupSubtitle: undefinedGuard(
      theme.textNavBar, c => changeContrast(c, 0.27)
    ),
    // ChatView
    chatViewBg: theme.bgChatView,
    chatViewBgImgPath: theme.bgImagePath,
    // ChatView - Composer
    composerText: '#415e6b',
    composerBg: theme.bgPrimary,
    composerBtnColor: '#616161',
    // Chat List
    chatListItemSelectedBg: '#4c6e7d',
    chatListItemSelectedBgHover: undefinedGuard(
      true, _ => Color('#4c6e7d').lighten(0.24).hex() // deltaSelected, but should be something else
    ),
    chatListItemSelectedText: theme.bgPrimary,
    chatListItemBgHover: undefinedGuard(
      theme.bgPrimary, c => changeContrast(c, 0.3)
    ),
    // Message Bubble
    messageText: theme.textPrimary,
    messageTextLink: theme.textPrimary, // same as message text
    setupMessageText: '#ed824e',
    infoMessageBubbleBg: '#000000',
    infoMessageBubbleText: 'white',
    messageIncommingBg: '#ffffff',
    messageIncommingDate: theme.textPrimary,
    messageOutgoingBg: '#efffde',
    messageOutgoingStatusColor: '#4caf50',
    // Message Bubble - Buttons
    messageButtons: '#8b8e91',
    messageButtonsHover: '#070c14',
    // Message Bubble - Metadata
    messageStatusIcon: '#a4a6a9',
    messageStatusIconSending: '#62656a',
    messagePadlockOutgoing: '#4caf50',
    messagePadlockIncomming: '#a4a6a9',
    messageMetadataImageNoCaption: '#ffffff',
    messageMetadataDate: '#62656a',
    messageMetadataIncomming: 'rgba(#ffffff, 0.7)',
    messageAuthor: '#ffffff',
    // Message Bubble - Attachments
    messageAttachmentIconExtentionColor: '#070c14', // Only changable with theme.raw
    messageAttachmentIconBg: '#ffffff', // Only changable with theme.raw
    messageAttachmentFileName: '#070c14',
    messageAttachmentFileSize: '#070c14',
    // Login Screen
    loginInputFocusColor: '#42A5F5',
    deltaChatPrimaryFg: '#070c14', // only used on login screen
    deltaChatPrimaryFgLight: '#62656a', // only used on login screen
    // Context Menu
    contextMenuBg: theme.bgSecondary,
    contextMenuBorder: undefinedGuard(
      theme.bgSecondary, c => changeContrast(c, 0.1)
    ),
    contextMenuText: theme.textSecondary,
    contextMenuSelected: theme.bgSecondary,
    contextMenuSelectedBg: '#a4a6a9',
    // Misc
    avatarLabelColor: '#ffffff',
    bp3DialogBg: theme.bgPrimary,
    bp3DialogCardBg: theme.bgSecondary,
    bp3Heading: theme.textPrimary,
    brokenMediaText: '#070c14',
    brokenMediaBg: '#ffffff',
    unreadCountBg: '#2090ea',
    unreadCountLabel: '#ffffff', // Only changable with theme.raw
    contactListItemBg: '#62656a',
    errorColor: '#f44336',
    globalLinkColor: '#2090ea', // Only changable with theme.raw
    globalBackground: theme.bgPrimary,
    globalText: theme.textPrimary,
    mapOverlayBg: theme.bgPrimary,
    videoPlayBtnIcon: '#2090ea',
    videoPlayBtnBg: '#ffffff',
    scrollBarThumb: undefinedGuard(
      theme.scrollbarTransparency, c => Color('black').alpha(c).rgb().string()
    ),
    scrollBarThumbHover: undefinedGuard(
      theme.scrollbarTransparency, c => Color('black').alpha(c + 0.14).rgb().string()
    )

  }
  Object.keys(themeData).forEach(key => themeData[key] === undefined ? delete themeData[key] : '')
  if (theme.raw) {
    themeData = Object.assign(themeData, theme.raw)
    console.log('theme.raw', theme.raw, themeData)
  }
  return themeData
}

export const defaultTheme = Object.freeze({
  bgImagePath: '../images/background_hd2.svg',
  bgPrimary: '#fff',
  bgSecondary: '#e6dcd3',
  textPrimary: '#111111',
  textSecondary: '#222222',
  ovalButtonBg: '#415e6b',
  ovalButtonText: '#fff',
  bgChatView: 'lime',
  bgNavBar: '#415e6b',
  textNavBar: '#fff',
  scrollbarTransparency: 0.4

})

export const defaultThemeData = Object.freeze(ThemeDataBuilder(defaultTheme))

export const ThemeVarOverwrite = (theme) => `
--clr-avatar-label: ${theme.avatarLabelColor};
--clr-bp3-dialog-bg: ${theme.bp3DialogBg};
--clr-bp3-dialog-card-bg: ${theme.bp3DialogCardBg};
--clr-bp3-heading: ${theme.bp3Heading}
--clr-broken-media-bg: ${theme.brokenMediaText};
--clr-broken-media-bg-text: ${theme.brokenMediaBg};
--clr-context-menu-bg: ${theme.contextMenuBg};
--clr-context-menu-border: ${theme.contextMenuBorder} ;
--clr-context-menu-text: ${theme.contextMenuText} ;
--clr-context-menu-selected: ${theme.contextMenuSelected};
--clr-context-menu-selected-bg: ${theme.contextMenuSelectedBg};
--clr-conversation-list-unread-count-bg: ${theme.unreadCountBg} ;
--clr-conversation-list-unread-count-label: ${theme.unreadCountLabel};
--clr-contact-list-item: ${theme.contactListItemBg};
--clr-composer-btn: ${theme.composerBtnColor};
--clr-error: ${theme.errorColor};
--clr-global-a: ${theme.globalLinkColor};
--clr-global-bg: ${theme.globalBackground};
--clr-global-text: ${theme.globalText};
--clr-map-overlay-bg: ${theme.mapOverlayBg};
--clr-message-status-icon: ${theme.messageStatusIcon};
--clr-message-status-icon-sending: ${theme.messageStatusIconSending};
--clr-message-buttons: ${theme.messageButtons};
--clr-message-buttons-hover: ${theme.messageButtonsHover};
--clr-message-padlock-outgoing: ${theme.messagePadlockOutgoing};
--clr-message-padlock-incomming: ${theme.messagePadlockIncomming};
--clr-message-metadata-image-no-caption: ${theme.messageMetadataImageNoCaption};
--clr-message-text: ${theme.messageText};
--clr-message-text-underline: ${theme.messageTextLink};
--clr-message-generic-attachment-icon-extension: ${theme.messageAttachmentIconExtentionColor};
--clr-message-generic-attachment-filename: ${theme.messageAttachmentFileName};
--clr-message-generic-attachment-filesize: ${theme.messageAttachmentFileSize};
--clr-message-attachment-container-bg: ${theme.messageAttachmentIconBg};
--clr-message-metadata-date: ${theme.messageMetadataDate};
--clr-message-metadata-date-incomming: ${theme.messageMetadataIncomming};
--clr-message-video-play: ${theme.videoPlayBtnIcon};
--clr-message-video-overlay-circle: ${theme.videoPlayBtnBg};
--clr-message-author: ${theme.messageAuthor};
--clr-scrollbar-thumb: ${theme.scrollBarThumb};
--clr-scrollbar-thumb-hover: ${theme.scrollBarThumbHover};
`
