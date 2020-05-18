export const appName = 'DeltaChat'
export const homePageUrl = 'https://delta.chat'
export const gitHubUrl = 'https://github.com/deltachat/deltachat-desktop'
export const gitHubIssuesUrl = gitHubUrl + '/issues'
export const gitHubLicenseUrl = gitHubUrl + '/blob/master/LICENSE'

// we can only convert this to an import when we find out how we can ignore
// "'rootDir' is expected to contain all source files."
// for this line
const { version } = require('../../package.json')

export const appVersion = version

export const appWindowTitle = appName

export const ZERO_SECONDS = 0
export const ONE_HOUR_IN_SECONDS = 60 * 60
export const TWO_HOURS_IN_SECONDS = 60 * 60 * 2
export const ONE_DAY_IN_SECONDS = 60 * 60 * 24
export const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7
export const FOUR_WEEKS_IN_SECONDS = 60 * 60 * 24 * 7 * 4
export const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
