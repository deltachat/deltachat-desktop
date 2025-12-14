export const appName = 'Delta Chat'
export const homePageUrl = 'https://delta.chat'
export const gitHubUrl = 'https://github.com/deltachat/deltachat-desktop'
export const gitHubIssuesUrl = gitHubUrl + '/issues'
export const gitHubLicenseUrl = gitHubUrl + '/blob/main/LICENSE'
export const donationUrl = 'https://delta.chat/donate'

export const appWindowTitle = appName

export const enum Timespans {
  ZERO_SECONDS = 0,
  ONE_SECOND = 1,
  ONE_MINUTE_IN_SECONDS = 60,
  ONE_HOUR_IN_SECONDS = 60 * 60,
  ONE_DAY_IN_SECONDS = 60 * 60 * 24,
  ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7,
  ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365,
}

export const enum AutodeleteDuration {
  NEVER = Timespans.ZERO_SECONDS,
  AT_ONCE = Timespans.ONE_SECOND,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  ONE_WEEK = Timespans.ONE_WEEK_IN_SECONDS,
  FIVE_WEEKS = Timespans.ONE_WEEK_IN_SECONDS * 5,
  ONE_YEAR = Timespans.ONE_YEAR_IN_SECONDS,
}

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'apng', 'gif', 'webp']

export const enum NOTIFICATION_TYPE {
  MESSAGE,
  REACTION,
  WEBXDC_INFO,
}
