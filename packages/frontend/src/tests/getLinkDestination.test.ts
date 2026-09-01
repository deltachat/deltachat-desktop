import * as linkify from 'linkifyjs'
import { expect } from 'chai'
import { before, describe, it } from 'mocha'

import { botcommand } from '../utils/linkify/plugin-bot-command/index.js'
import { parseElements } from '../utils/linkify/parseElements.js'
import { getLinkDestination } from '../utils/linkify/getLinkDestination.js'

/**
 * Parse `text` the same way `MessageParser` does and return the destination of
 * its single `url` element.
 */
function destinationOfSingleUrl(text: string) {
  const urlElements = parseElements(text).filter(el => el.t === 'url')
  expect(urlElements, `expected one url element in "${text}"`).to.have.length(1)
  return getLinkDestination(urlElements[0]!)
}

describe('getLinkDestination', () => {
  before(() => {
    // `MessageParser` registers this plugin, and it influences how message
    // text gets tokenized, so register it here as well.
    linkify.reset()
    linkify.registerPlugin('botcommand', botcommand)
  })

  it('adds https as the default scheme for URLs without one', () => {
    const cases = [
      ['example.com', 'https://example.com'],
      ['www.example.com', 'https://www.example.com'],
      ['example.com/test', 'https://example.com/test'],
      ['localhost:8080', 'https://localhost:8080'],
    ] as const

    for (const [text, expectedTarget] of cases) {
      const destination = destinationOfSingleUrl(text)
      expect(destination?.target, text).to.equal(expectedTarget)
      expect(destination?.scheme, text).to.equal('https')
      expect(destination?.linkText, text).to.equal(text)
    }
  })

  it('keeps the scheme of URLs that have one', () => {
    const cases = [
      ['http://example.com', 'http://example.com', 'http'],
      ['https://example.com/test', 'https://example.com/test', 'https'],
      ['ftp://example.com/pub', 'ftp://example.com/pub', 'ftp'],
      // schemes that don't require slashes have a `SCHEME`
      // instead of a `SLASH_SCHEME` token
      ['mailto:someone@example.com', 'mailto:someone@example.com', 'mailto'],
      ['file:///etc/passwd', 'file:///etc/passwd', 'file'],
    ] as const

    for (const [text, expectedTarget, expectedScheme] of cases) {
      const destination = destinationOfSingleUrl(text)
      expect(destination?.target, text).to.equal(expectedTarget)
      expect(destination?.scheme, text).to.equal(expectedScheme)
    }
  })

  // https://github.com/deltachat/deltachat-desktop/issues/6628
  it('adds the default scheme when a scheme-like token is not the scheme', () => {
    const cases = [
      // "ftp" in the path is tokenized as `SLASH_SCHEME`
      ['example.com/fun_ftp_facts', 'https://example.com/fun_ftp_facts'],
      // "mailto" in the path is tokenized as `SCHEME`
      ['example.com/mailto_link', 'https://example.com/mailto_link'],
      // "ftp" as a subdomain is tokenized as `SLASH_SCHEME` as well
      ['ftp.example.com', 'https://ftp.example.com'],
    ] as const

    for (const [text, expectedTarget] of cases) {
      const destination = destinationOfSingleUrl(text)
      expect(destination, `"${text}" must be a link`).to.not.equal(null)
      expect(destination?.target, text).to.equal(expectedTarget)
      expect(destination?.scheme, text).to.equal('https')
    }
  })

  it('does not turn the rest of the message into text when one URL is odd', () => {
    const elements = parseElements(
      'see example.com/fun_ftp_facts and https://delta.chat'
    )
    const targets = elements
      .filter(el => el.t === 'url')
      .map(el => getLinkDestination(el)?.target)

    expect(targets).to.eql([
      'https://example.com/fun_ftp_facts',
      'https://delta.chat',
    ])
  })

  it('reports a punycode warning for non-ascii hostnames', () => {
    // Written as an escape on purpose: the first character is a Cyrillic
    // "\u0430", which is indistinguishable from a latin "a" in the source.
    const homograph = '\u0430pple.com' // "аpple.com" (starts with a cyrillic a)
    const destination = destinationOfSingleUrl(homograph)

    expect(destination?.hostname).to.equal('xn--pple-43d.com')
    expect(destination?.punycode).to.eql({
      ascii_hostname: 'xn--pple-43d.com',
      punycode_encoded_url: 'https://xn--pple-43d.com/',
      original_hostname_or_full_url: homograph,
    })
  })

  it('reports a punycode warning for a non-ascii tld', () => {
    // "пример.рф" is the russian "example.com"; both labels are non-ascii
    const destination = destinationOfSingleUrl('пример.рф')

    expect(destination?.hostname).to.equal('xn--e1afmkfd.xn--p1ai')
    expect(destination?.punycode).to.eql({
      ascii_hostname: 'xn--e1afmkfd.xn--p1ai',
      punycode_encoded_url: 'https://xn--e1afmkfd.xn--p1ai/',
      original_hostname_or_full_url: 'пример.рф',
    })
  })

  it('reports no punycode warning for ascii hostnames', () => {
    for (const text of ['example.com', 'https://example.com/test']) {
      const destination = destinationOfSingleUrl(text)
      expect(destination?.punycode, text).to.equal(null)
      expect(destination?.hostname, text).to.equal('example.com')
    }
  })
})
