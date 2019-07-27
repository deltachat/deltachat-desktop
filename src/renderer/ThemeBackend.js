const styled = require('styled-components').default
var Color = require('color')

export function ThemeDataBuilder (theme) {
  // todo resolve all strings to be dependent on vars of the highLevelObject
  // Its ok when highLevelObject is missing some properties
  // and the returned object misses some values as result,
  // because it gets merged with the default theme later anyway

  // #070c14; // some kind of font color?
  let themeData = {
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
    setupMessageText: '#ed824e',
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
    deltaChatPrimaryFgLight: '#62656a', // only used on login screen
    // From scss - need sorting and deduplication from the ones above
    avatarLabelColor: '#ffffff',
    bp3DialogBg: '#ececec',
    brokenMediaText: '#070c14',
    brokenMediaBg: '#ffffff',
    contextMenuBg: '#f9fafa',
    contextMenuBorder: '#efefef',
    contextMenuText: '#070c14',
    contextMenuSelected: '#fff',
    contextMenuSelectedBg: '#a4a6a9',
    unreadCountBg: '#2090ea',
    unreadCountLabel: '#ffffff',
    contactListItemBg: '#62656a',
    composerBtnColor: '#616161',
    errorColor: '#f44336',
    globalLinkColor: '#2090ea',
    globalBackground: '#fff',
    globalText: '#070c14',
    mapOverlayBg: '#ffffff',
    messageStatusIcon: '#a4a6a9',
    messageStatusIconSending: '#62656a',
    messagePadlockOutgoing: '#4caf50',
    messagePadlockIncomming: '#a4a6a9',
    messageMetadataImageNoCaption: '#ffffff',
    messageTextLink: '#070c14',
    messageAttachmentIconExtentionColor: '#070c14',
    messageAttachmentIconBg: '#ffffff',
    messageAttachmentFileName: '#070c14',
    messageAttachmentFileSize: '#070c14',
    messageMetadataDate: '#62656a',
    messageMetadataIncomming: 'rgba(#ffffff, 0.7)',
    videoPlayBtnIcon: '#2090ea',
    videoPlayBtnBg: '#ffffff',
    messageAuthor: '#ffffff',
    scrollBarThumb: '#666666',
    scrollBarThumbHover: '#606060',

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
--clr-avatar-label: ${props => props.theme.avatarLabelColor};
--clr-bp3-dialog-bg: ${props => props.theme.bp3DialogBg};
--clr-broken-media-bg: ${props => props.theme.brokenMediaText};
--clr-broken-media-bg-text: ${props => props.theme.brokenMediaBg};
--clr-context-menu-bg: ${props => props.theme.contextMenuBg};
--clr-context-menu-border: ${props => props.theme.contextMenuBorder} ;
--clr-context-menu-text: ${props => props.theme.contextMenuText} ;
--clr-context-menu-selected: ${props => props.theme.contextMenuSelected};
--clr-context-menu-selected-bg: ${props => props.theme.contextMenuSelectedBg};
--clr-conversation-list-unread-count-bg: ${props => props.theme.unreadCountBg} ;
--clr-conversation-list-unread-count-label: ${props => props.theme.unreadCountLabel};
--clr-contact-list-item: ${props => props.theme.contactListItemBg};
--clr-composer-btn: ${props => props.theme.composerBtnColor};
--clr-error: ${props => props.theme.errorColor};
--clr-global-a: ${props => props.theme.globalLinkColor};
--clr-global-bg: ${props => props.theme.globalBackground};
--clr-global-text: ${props => props.theme.globalText};
--clr-map-overlay-bg: ${props => props.theme.mapOverlayBg};
--clr-message-status-icon: ${props => props.theme.messageStatusIcon};
--clr-message-status-icon-sending: ${props => props.theme.messageStatusIconSending};
--clr-message-buttons: ${props => props.theme.messageButtons};
--clr-message-buttons-hover: ${props => props.theme.messageButtonsHover};
--clr-message-padlock-outgoing: ${props => props.theme.messagePadlockOutgoing};
--clr-message-padlock-incomming: ${props => props.theme.messagePadlockIncomming};
--clr-message-metadata-image-no-caption: ${props => props.theme.messageMetadataImageNoCaption};
--clr-message-text: ${props => props.theme.messageText};
--clr-message-text-underline: ${props => props.theme.messageTextLink};
--clr-message-generic-attachment-icon-extension: ${props => props.theme.messageAttachmentIconExtentionColor};
--clr-message-generic-attachment-filename: ${props => props.theme.messageAttachmentFileName};
--clr-message-generic-attachment-filesize: ${props => props.theme.messageAttachmentFileSize};
--clr-message-attachment-container-bg: ${props => props.theme.messageAttachmentIconBg};
--clr-message-metadata-date: ${props => props.theme.messageMetadataDate};
--clr-message-metadata-date-incomming: ${props => props.theme.messageMetadataIncomming};
--clr-message-video-play: ${props => props.theme.videoPlayBtnIcon};
--clr-message-video-overlay-circle: ${props => props.theme.videoPlayBtnBg};
--clr-message-author: ${props => props.theme.messageAuthor};
--clr-scrollbar-thumb: ${props => props.theme.scrollBarThumb};
--clr-scrollbar-thumb-hover: ${props => props.theme.scrollBarThumbHover};
`
