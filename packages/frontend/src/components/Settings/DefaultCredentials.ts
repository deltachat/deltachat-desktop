import { T } from '@deltachat/jsonrpc-client'

export type Credentials = T.EnteredLoginParam & ProxySettings

export type ProxySettings = {
  proxyEnabled: boolean
  proxyUrl: string | null
}

export enum Proxy {
  DISABLED = '0',
  ENABLED = '1',
}

export function defaultCredentials(credentials?: Credentials): Credentials {
  const defaultCredentials: Credentials = {
    addr: '',
    imapUser: null,
    password: '',
    imapServer: null,
    imapPort: null,
    imapSecurity: null,
    certificateChecks: null,
    smtpUser: null,
    smtpPassword: null,
    smtpServer: null,
    smtpPort: null,
    smtpSecurity: null,
    oauth2: null,
    proxyEnabled: false,
    proxyUrl: null,
  }

  return { ...defaultCredentials, ...credentials }
}
