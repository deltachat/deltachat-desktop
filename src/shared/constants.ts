import { readJsonSync } from "fs-extra"

export const appName = 'DeltaChat'
export const homePageUrl = 'https://delta.chat'
export const gitHubUrl = 'https://github.com/deltachat/deltachat-desktop'
export const gitHubIssuesUrl = gitHubUrl + '/issues'
export const gitHubLicenseUrl = gitHubUrl + '/blob/master/LICENSE'

// we can only convert this to an import when we find out how we can ignore
// "'rootDir' is expected to contain all source files."
// for this line
const { version } = readJsonSync('../../package.json')

export const appVersion = version

export const appWindowTitle = appName
