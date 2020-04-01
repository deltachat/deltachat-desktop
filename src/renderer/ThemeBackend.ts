import Color from 'color'
import { getLogger } from '../shared/logger'

const log = getLogger('render/theme-backend')

function changeContrast(colorString: string, factor: number): string {
  // TODO make the black check code work
  const color =
    Color(colorString).hex() === '#000000'
      ? Color('#010101')
      : Color(colorString)
  if (color.isDark()) {
    // console.log('dark')
    return color
      .lighten(factor)
      .rgb()
      .string()
  } else if (color.isLight()) {
    // console.log('light')
    return color
      .darken(factor)
      .rgb()
      .string()
  }
}

function invertColor(colorString: string): string {
  return Color(colorString)
    .negate()
    .rgb()
    .string()
}

function changeSaturation(colorString: string, factor: number): string {
  const color = Color(colorString)
  if (factor < 0) {
    return color
      .desaturate((factor *= -1))
      .rgb()
      .string()
  } else if (factor > 0) {
    return color
      .saturate(factor)
      .rgb()
      .string()
  } else {
    return color.rgb().string()
  }
}

function blendColor(
  colorString0: string,
  colorString1: string,
  factor: number
): string {
  const color0 = Color(colorString0)
  const color1 = Color(colorString1)
  return color0
    .mix(color1, factor)
    .rgb()
    .string()
}

function undefinedGuard<T, R>(
  rawValue: T,
  func: (...values: T extends any[] ? T : [T]) => R
): R {
  const values = (Array.isArray(rawValue)
    ? rawValue
    : [rawValue]) as T extends any[] ? T : [T]
  return notUndefined(...values) ? func(...values) : undefined
}

function notUndefined(...variables: (any | undefined)[]) {
  return !variables
    .map(v => typeof v === 'undefined')
    .reduce((acc, cur) => acc || cur)
}

export function ThemeDataBuilder(theme: { [key: string]: string }) {
  // todo resolve all strings to be dependent on vars of the highLevelObject
  // Its ok when highLevelObject is missing some properties
  // and the returned object misses some values as result,
  // because it gets merged with the default theme later anyway
  let themeData = {
    // Misc
    colorPrimary: theme.colorPrimary,
    colorDanger: theme.colorDanger,
    colorNone: theme.colorNone,
    ovalButtonBg: theme.ovalButtonBg,
    ovalButtonBgHover: undefinedGuard(theme.ovalButtonBg, c =>
      changeContrast(c, 0.7)
    ),
    ovalButtonText: theme.ovalButtonText,
    ovalButtonTextHover: undefinedGuard(theme.ovalButtonText, c =>
      changeSaturation(invertColor(c), -1)
    ),
    // NavBar
    navBarBackground: theme.bgNavBar,
    navBarText: theme.textNavBar,
    navBarSearchPlaceholder: undefinedGuard(
      theme.textNavBar,
      c => changeContrast(c, 0.27) // '#d0d0d0',
    ),
    navBarGroupSubtitle: undefinedGuard(theme.textNavBar, c =>
      changeContrast(c, 0.27)
    ),
    // ChatView
    chatViewBg: theme.bgChatView,
    chatViewBgImgPath: undefinedGuard(theme.bgImagePath, path =>
      path !== 'none' ? `url(${path})` : 'none'
    ),
    // ChatView - Composer
    composerBg: theme.bgPrimary,
    composerText: theme.textPrimary,
    composerPlaceholderText: undefinedGuard(theme.textPrimary, c =>
      Color(c)
        .alpha(0.5)
        .rgb()
        .string()
    ),
    composerBtnColor: undefinedGuard(theme.textPrimary, c =>
      Color(c)
        .alpha(0.9)
        .rgb()
        .string()
    ),
    composerSendButton: '#415e6b',
    emojiSelectorSelectionColor: theme.accentColor,
    // Chat List
    chatListItemSelectedBg: '#4c6e7d',
    chatListItemSelectedBgHover: undefinedGuard(true, _ =>
      Color('#4c6e7d')
        .lighten(0.24)
        .hex()
    ),
    chatListItemSelectedText: theme.bgPrimary,
    chatListItemBgHover: undefinedGuard(theme.bgPrimary, c =>
      changeContrast(c, 0.3)
    ),
    chatListBorderColor: undefinedGuard(theme.bgPrimary, bg =>
      Color(bg).isDark() ? '#111' : '#b9b9b9'
    ),
    chatListBorder: undefinedGuard(
      theme.chatListBorderColor,
      c => '1px solid ' + c
    ),
    // Message Bubble
    messageText: theme.textPrimary,
    messageTextLink: theme.textPrimary, // same as message text
    setupMessageText: '#ed824e',
    infoMessageBubbleBg: '#0000008c',
    infoMessageBubbleText: 'white',
    messageIncommingBg: theme.bgMessageBubbleIncoming,
    messageIncommingDate: theme.textPrimary,
    messageOutgoingBg: theme.bgMessageBubbleOutgoing,
    messageOutgoingStatusColor: '#4caf50',
    // Message Bubble - Buttons
    messageButtons: '#8b8e91',
    messageButtonsHover: '#070c14',
    // Message Bubble - Metadata
    messageStatusIcon: '#4caf50',
    messageStatusIconSending: '#62656a',
    messagePadlockOutgoing: '#4caf50',
    messagePadlockIncomming: '#a4a6a9',
    messageMetadataDate: '#62656a',
    messageMetadataIncomming: 'rgba(#ffffff, 0.7)',
    messageAuthor: '#ffffff',
    // Message Bubble - Attachments
    messageAttachmentIconExtentionColor: '#070c14', // Only changable with theme.raw
    messageAttachmentIconBg: 'transparent', // Only changable with theme.raw
    messageAttachmentFileInfo: theme.textPrimary,
    // Login Screen
    loginInputFocusColor: theme.colorPrimary,
    loginButtonText: theme.colorPrimary,
    deltaChatPrimaryFg: theme.textPrimary, // todo rename this var
    deltaChatPrimaryFgLight: theme.textSecondary, // todo rename this var
    // Context Menu
    contextMenuBg: theme.bgPrimary,
    contextMenuBorder: undefinedGuard(theme.bgSecondary, c =>
      changeContrast(c, 0.1)
    ),
    contextMenuText: theme.textSecondary,
    contextMenuSelected: theme.bgSecondary,
    contextMenuSelectedBg: '#a4a6a9',
    // Bp3 overwrites
    bp3DialogHeaderBg: theme.bgPrimary,
    bp3DialogHeaderIcon: '#666666',
    bp3DialogBgSecondary: theme.bgSecondary,
    bp3DialogBgPrimary: theme.bgPrimary,
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
    bp3MenuBg: theme.bgPrimary,
    bp3Switch: '#7a8084',
    bp3SwitchShadow: 'unset',
    bp3SwitchChecked: '#acd4e8',
    bp3SwitchShadowChecked: 'unset',
    bp3SwitchKnob: '#f5f5f5',
    bp3SwitchKnobShadow: '0px 2px 0 0px #d2cfcfad',
    bp3SwitchKnobChecked: '#42A5F5',
    bp3SwitchKnobShadowChecked: '0px 1px 0 0px #c9d4d2d1',
    bp3SpinnerTrack: '#acd4e8',
    bp3SpinnerHead: '#42a5f5',
    bp3SelectorTop: 'rgba(255, 255, 255, 0.8)',
    bp3SelectorBottom: 'rgba(255, 255, 255, 0.0)',
    outlineProperties: '1px solid transparent',
    outlineColor: 'b9b9b9',
    // EmojiMart overwrites
    emojiMartText: theme.textPrimary,
    emojiMartBorder: theme.outlineColor,
    emojiMartSearchBorder: 'lightgrey',
    emojiMartBg: theme.bgPrimary,
    emojiMartOutsideRadius: '5px',
    emojiMartCategoryIcons: undefinedGuard(
      [theme.textPrimary, theme.bgSecondary],
      (c1, c2) => blendColor(c1, c2, 0.4)
    ),
    emojiMartInputBg: theme.bgSecondary,
    emojiMartInputText: theme.textPrimary,
    emojiMartInputPlaceholder: undefinedGuard(
      [theme.textPrimary, theme.bgSecondary],
      (c1, c2) => blendColor(c1, c2, 0.3)
    ),
    emojiMartSelect: undefinedGuard(theme.bgSecondary, c =>
      blendColor(c, invertColor(c), 0.2)
    ),
    // Misc
    galleryBg: theme.bgPrimary,
    avatarLabelColor: '#ffffff', // Only changable with theme.raw
    brokenMediaText: '#070c14',
    brokenMediaBg: '#ffffff',
    unreadCountBg: theme.accentColor,
    unreadCountLabel: '#ffffff', // Only changable with theme.raw
    contactListItemBg: '#62656a',
    contactListInitalColor: theme.textSecondary,
    contactEmailColor: theme.textSecondary,
    errorColor: '#f44336',
    globalLinkColor: '#2090ea', // Only changable with theme.raw
    globalBackground: theme.bgPrimary,
    globalText: theme.textPrimary,
    mapOverlayBg: theme.bgPrimary,
    videoPlayBtnIcon: theme.accentColor,
    videoPlayBtnBg: '#ffffff', // Only changable with theme.raw
    scrollbarThumb: undefinedGuard(
      [theme.scrollbarTransparency, theme.bgPrimary],
      (t, c) =>
        Color(Color(c).isDark() ? 'white' : 'grey')
          .alpha(Number(t))
          .rgb()
          .string()
    ),
    scrollbarThumbHover: undefinedGuard(
      [theme.scrollbarTransparency, theme.bgPrimary],
      (t, c) =>
        Color(Color(c).isDark() ? 'white' : 'grey')
          .alpha(Number(t) + 0.14)
          .rgb()
          .string()
    ),
  }
  Object.keys(themeData).forEach((key: keyof typeof themeData) =>
    themeData[key] === undefined ? delete themeData[key] : ''
  )
  if (theme.raw) {
    themeData = Object.assign(themeData, theme.raw)
    log.debug('theme.raw', theme.raw, themeData)
  }

  return themeData
}

export const defaultTheme = Object.freeze(require('../../themes/light.json'))

export const defaultThemeData = Object.freeze(ThemeDataBuilder(defaultTheme))

export const ThemeVarOverwrite = (
  themeData: ReturnType<typeof ThemeDataBuilder>
) => {
  var css = ''
  for (var key in defaultThemeData) {
    if (Object.hasOwnProperty.bind(defaultThemeData, key)) {
      css += `--${key}: ${
        themeData[key as keyof ReturnType<typeof ThemeDataBuilder>]
      };`
    }
  }
  return `:root {${css}}`
}
