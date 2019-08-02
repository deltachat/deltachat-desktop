const Color = require('color')
const log = require('../logger').getLogger('render/theme-backend')

function changeContrast (colorString, factor) {
  // TODO make the black check code work
  const color = Color(colorString).hex() === '#000000' ? Color('#010101') : Color(colorString)
  if (color.isDark()) {
    // console.log('dark')
    return color.lighten(factor).rgb().string()
  } else if (color.isLight()) {
    // console.log('light')
    return color.darken(factor).rgb().string()
  }
}

function invertColor (colorString) {
  return Color(colorString).negate().rgb().string()
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

function blendColor (colorString0, colorString1, factor) {
  const color0 = Color(colorString0)
  const color1 = Color(colorString1)
  return color0.mix(color1, factor).rgb().string()  
}

function undefinedGuard (rawValue, func) {
  const values = Array.isArray(rawValue) ? rawValue : [rawValue]
  return notUndefined(...values) ? func(...values) : undefined
}

function notUndefined (...variables) {
  return !variables.map(v => typeof v === 'undefined').reduce((acc, cur) => acc || cur)
}

export function ThemeDataBuilder (theme) {
  // todo resolve all strings to be dependent on vars of the highLevelObject
  // Its ok when highLevelObject is missing some properties
  // and the returned object misses some values as result,
  // because it gets merged with the default theme later anyway
  /// Don't use color directly here
  const bp3SwitchShadowColor = 'rgba(16,22,26,.4)'
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
    composerBg: theme.bgPrimary,
    composerText: theme.textPrimary,
    composerPlaceholderText: undefinedGuard(
      theme.textPrimary, c => Color(c).alpha(0.5).rgb().string()
    ),
    composerBtnColor: undefinedGuard(
      theme.textPrimary, c => Color(c).alpha(0.9).rgb().string()
    ),
    composerSendButton: '#415e6b',
    emojiSelectorSelectionColor: theme.accentColor,
    // Chat List
    chatListItemSelectedBg: '#4c6e7d',
    chatListItemSelectedBgHover: undefinedGuard(
      true, _ => Color('#4c6e7d').lighten(0.24).hex()
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
    messageAttachmentFileInfo: theme.textPrimary,
    // Login Screen
    loginInputFocusColor: '#42A5F5',
    loginButtonText: '#42A5F5',
    deltaChatPrimaryFg: theme.textPrimary, // todo rename this var
    deltaChatPrimaryFgLight: theme.textSecondary, // todo rename this var
    // Context Menu
    contextMenuBg: theme.bgSecondary,
    contextMenuBorder: undefinedGuard(
      theme.bgSecondary, c => changeContrast(c, 0.1)
    ),
    contextMenuText: theme.textSecondary,
    contextMenuSelected: theme.bgSecondary,
    contextMenuSelectedBg: '#a4a6a9',
    // Bp3 overwrites
    bp3DialogHeaderBg: theme.bgSecondary,
    bp3DialogHeaderIcon: '#5c7080',
    bp3DialogBg: theme.bgPrimary,
    bp3DialogCardBg: theme.bgSecondary,
    bp3Heading: theme.textPrimary,
    bp3ButtonText: theme.textPrimary,
    bp3ButtonBg: theme.bgPrimary,
    bp3ButtonGradientTop: 'rgba(255,255,255,0.8)',
    bp3ButtonGradientBottom: 'rgba(255,255,255,0)',
    bp3ButtonHoverBg: '#ebf1f5',
    bp3InputText: theme.textPrimary,
    bp3InputBg: theme.bgPrimary,
    bp3InputPlaceholder: 'lightgray',
    bp3MenuText: theme.textPrimary,
    bp3MenuBg: theme.bgSecondary,
    bp3SwitchBg: 'rgba(130, 165, 188, 0.5)',
    bp3SwitchBeforeShadow: bp3SwitchShadowColor,
    bp3SwitchBeforeBg: 'RGBA(57, 75, 89, 1)',
    bp3SwitchChecked: theme.accentColor,
    bp3SwitchCheckedBeforeShadow: bp3SwitchShadowColor,
    // EmojiMart overwrites
    emojiMartText: theme.textPrimary,
    emojiMartBorder: undefinedGuard(
      theme.bgSecondary, c => changeContrast(c, 0.1)
    ),
    emojiMartBg: theme.bgSecondary,
    emojiMartCategoryIcons: undefinedGuard(
      [theme.textPrimary, theme.bgSecondary], (c1, c2) => blendColor(c1, c2, 0.4)
    ),
    emojiMartInputBg: theme.bgSecondary,
    emojiMartInputText: theme.textPrimary,
    emojiMartInputPlaceholder: undefinedGuard(
      [theme.textPrimary, theme.bgSecondary], (c1, c2) => blendColor(c1, c2, 0.3)
    ),
    emojiMartSelect: undefinedGuard(
      theme.bgSecondary, c => blendColor(c, invertColor(c), 0.2) 
    ),
    // Misc
    avatarLabelColor: '#ffffff', // Only changable with theme.raw
    brokenMediaText: '#070c14',
    brokenMediaBg: '#ffffff',
    unreadCountBg: theme.accentColor,
    unreadCountLabel: '#ffffff', // Only changable with theme.raw
    contactListItemBg: '#62656a',
    errorColor: '#f44336',
    globalLinkColor: '#2090ea', // Only changable with theme.raw
    globalBackground: theme.bgPrimary,
    globalText: theme.textPrimary,
    mapOverlayBg: theme.bgPrimary,
    videoPlayBtnIcon: theme.accentColor,
    videoPlayBtnBg: '#ffffff', // Only changable with theme.raw
    scrollBarThumb: undefinedGuard(
      [theme.scrollbarTransparency, theme.bgPrimary],
      (t, c) => Color(Color(c).isDark() ? 'white' : 'grey').alpha(t).rgb().string()
    ),
    scrollBarThumbHover: undefinedGuard(
      [theme.scrollbarTransparency, theme.bgPrimary],
      (t, c) => Color(Color(c).isDark() ? 'white' : 'grey').alpha(t + 0.14).rgb().string()
    )

  }
  Object.keys(themeData).forEach(key => themeData[key] === undefined ? delete themeData[key] : '')
  if (theme.raw) {
    themeData = Object.assign(themeData, theme.raw)
    log.debug('theme.raw', theme.raw, themeData)
  }
  return themeData
}

export const defaultTheme = Object.freeze({
  bgImagePath: '../images/background_light.svg',
  bgPrimary: '#fff',
  bgSecondary: '#f5f5f5',
  accentColor: '#2090ea',
  textPrimary: '#010101',
  textSecondary: '#62656a',
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
--clr-message-generic-attachment-fileinfo: ${theme.messageAttachmentFileInfo};
--clr-message-attachment-container-bg: ${theme.messageAttachmentIconBg};
--clr-message-metadata-date: ${theme.messageMetadataDate};
--clr-message-metadata-date-incomming: ${theme.messageMetadataIncomming};
--clr-message-video-play: ${theme.videoPlayBtnIcon};
--clr-message-video-overlay-circle: ${theme.videoPlayBtnBg};
--clr-scrollbar-thumb: ${theme.scrollBarThumb};
--clr-scrollbar-thumb-hover: ${theme.scrollBarThumbHover};
--clr-emoji-mart-text: ${theme.emojiMartText};
--clr-emoji-mart-border: ${theme.emojiMartBorder};
--clr-emoji-mart-bg: ${theme.emojiMartBg};
--clr-emoji-mart-category-icons: ${theme.emojiMartCategoryIcons};
--clr-emoji-mart-input-text: ${theme.emojiMartInputText};
--clr-emoji-mart-input-bg: ${theme.emojiMartInputBg};
--clr-emoji-mart-input-placeholder: ${theme.emojiMartInputPlaceholder};
--clr-emoji-mart-select: ${theme.emojiMartSelect};
--clr-bp3-dialog-bg: ${theme.bp3DialogBg};
--clr-bp3-dialog-card-bg: ${theme.bp3DialogCardBg};
--clr-bp3-heading: ${theme.bp3Heading}
--clr-bp3-button-text: ${theme.bp3ButtonText};
--clr-bp3-button-bg: ${theme.bp3ButtonBg};
--clr-bp3-button-gradient-top: ${theme.bp3ButtonGradientTop};
--clr-bp3-button-gradient-bottom: ${theme.bp3ButtonGradientBottom};
--clr-bp3-button-hover: ${theme.bp3ButtonHoverBg};
--clr-bp3-dialog-header-bg: ${theme.bp3DialogHeaderBg};
--clr-bp3-menu-bg: ${theme.bp3MenuBg};
--clr-bp3-menu: ${theme.bp3MenuText};
--clr-bp3-input-bg: ${theme.bp3InputBg};        
--clr-bp3-input: ${theme.bp3InputText};                 
--clr-bp3-input-placeholder: ${theme.bp3InputPlaceholder};     
--clr-bp3-dialog-header-icon: ${theme.bp3DialogHeaderIcon};
--clr-bp3-switch-bg: ${theme.bp3SwitchBg};
--clr-bp3-switch-before-shadow: ${theme.bp3SwitchBeforeShadow};
--clr-bp3-switch-before-bg: ${theme.bp3SwitchBeforeBg};
--clr-bp3-switch-checked: ${theme.bp3SwitchChecked};
--clr-bp3-switch-checked-before-shadow: ${theme.bp3SwitchCheckedBeforeShadow};
`
