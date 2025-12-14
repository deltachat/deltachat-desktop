import * as linkify from 'linkifyjs'
import { botcommand } from '../utils/linkify/plugin-bot-command/index.js'
import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'

import { parseElements } from '../utils/linkify/parseElements.js'

describe('linkify-plugin-botcommand', () => {
  beforeEach(() => {
    linkify.reset()
  })

  it('cannot parse bot commands before applying the plugin', () => {
    expect(
      linkify.find('Use /help to get assistance or /status to check the system')
    ).to.be.eql([])

    expect(linkify.test('/help', 'botcommand')).to.equal(false)
    expect(linkify.test('/status', 'botcommand')).to.equal(false)
  })

  describe('after plugin is applied', () => {
    beforeEach(() => {
      linkify.registerPlugin('botcommand', botcommand)
    })

    it('can parse bot commands after applying the plugin', () => {
      expect(
        linkify.find(
          'Use /help to get assistance or /status to check the system'
        )
      ).to.be.eql([
        {
          type: 'botcommand',
          value: '/help',
          href: '/help',
          isLink: true,
          start: 4,
          end: 9,
        },
        {
          type: 'botcommand',
          value: '/status',
          href: '/status',
          isLink: true,
          start: 31,
          end: 38,
        },
      ])
    })

    it('Works with basic bot commands', () => {
      expect(linkify.test('/help', 'botcommand')).to.equal(true)
      expect(linkify.test('/status', 'botcommand')).to.equal(true)
    })

    it('Works with bot commands containing hyphens', () => {
      expect(linkify.test('/help-me', 'botcommand')).to.equal(true)
      expect(linkify.test('/check-status', 'botcommand')).to.equal(true)
    })

    it('Works with bot commands containing slashes', () => {
      expect(linkify.test('/help/me', 'botcommand')).to.equal(true)
      expect(linkify.test('/check/status', 'botcommand')).to.equal(true)
    })

    it('Works with bot commands containing underscores or dots', () => {
      expect(linkify.test('/help_me', 'botcommand')).to.equal(true)
      expect(linkify.test('/status_check', 'botcommand')).to.equal(true)
      expect(linkify.test('/test.', 'botcommand')).to.equal(true)
    })

    it('Works with bot commands containing @ sign', () => {
      expect(linkify.test('/jumpto@something', 'botcommand')).to.equal(true)
    })

    it('Works with alphanumeric bot commands', () => {
      expect(linkify.test('/cmd123', 'botcommand')).to.equal(true)
      expect(linkify.test('/test2', 'botcommand')).to.equal(true)
      // but not if the first token is a number
      expect(linkify.test('/1234', 'botcommand')).to.equal(false)
    })

    it('Works with mixed case bot commands', () => {
      expect(linkify.test('/Help', 'botcommand')).to.equal(true)
      expect(linkify.test('/STATUS', 'botcommand')).to.equal(true)
      expect(linkify.test('/ConfigDebug', 'botcommand')).to.equal(true)
    })

    it('Does not work with just a slash', () => {
      expect(linkify.test('/', 'botcommand')).to.equal(false)
    })

    // although we want to limit the bot commands to word boundaries,
    // it is not possible to do so with the current implementation of linkify.
    // this test proves that this is still the case and our filter workaround
    // is needed.
    it('Is not limited to word boundaries', () => {
      expect(
        linkify.tokenize('test/help').filter(el => el.t === 'botcommand')
      ).to.have.length(1)
      expect(
        linkify.tokenize('path/to/file').filter(el => el.t === 'botcommand')
      ).to.have.length(1)
      expect(
        linkify.tokenize('1/test').filter(el => el.t === 'botcommand')
      ).to.have.length(1)
      expect(
        linkify.tokenize('_/test').filter(el => el.t === 'botcommand')
      ).to.have.length(1)
    })

    //
    it('Does not include invalid characters', () => {
      // string is divided in 2 elements - botcommand and text element
      expect(linkify.tokenize('/help#invalid')).to.have.length(2)
      expect(linkify.tokenize('/help$invalid')).to.have.length(2)
      expect(linkify.tokenize('/info:details')).to.have.length(2)
      expect(linkify.tokenize('/help-debug=true')).to.have.length(2)
      expect(linkify.tokenize('/config?verbose')).to.have.length(2)
      expect(linkify.tokenize('/warn!critical')).to.have.length(2)
    })
  })
})

describe('parseElements functionality', () => {
  beforeEach(() => {
    linkify.reset()
    linkify.registerPlugin('botcommand', botcommand)
  })

  it('should properly identify and process bot commands in text', () => {
    const elements = parseElements('Use /help to get assistance')
    const botCommandElements = elements!.filter(
      (el: any) => el.t === 'botcommand'
    )
    expect(botCommandElements).to.have.length(1)
    expect(botCommandElements[0].v).to.equal('/help')
  })

  it('should identify different types of content in mixed text', () => {
    const text =
      'Visit https://example.com or email test@example.com or use /help'
    const elements = parseElements(text)
    expect(elements !== null).to.equal(true)

    const urls = elements!.filter((el: any) => el.t === 'url')
    const emails = elements!.filter((el: any) => el.t === 'email')
    const botCommands = elements!.filter((el: any) => el.t === 'botcommand')

    expect(urls).to.have.length(1)
    expect(emails).to.have.length(1)
    expect(botCommands).to.have.length(1)

    expect(urls[0].v).to.equal('https://example.com')
    expect(emails[0].v).to.equal('test@example.com')
    expect(botCommands[0].v).to.equal('/help')
  })

  it('should identify bot commands at start of text and after spaces', () => {
    const testCases = ['/help', 'Use /help command', 'Try /status now']

    testCases.forEach(testCase => {
      const elements = parseElements(testCase)
      expect(elements !== null).to.equal(true)

      const botCommandElements = elements!.filter(
        (el: any) => el.t === 'botcommand'
      )
      expect(botCommandElements).to.have.length.greaterThan(0)
    })
  })

  it('should handle simple text content', () => {
    // Test that parseElements works correctly with simple text
    const simpleText = 'Hello world'
    const elements = parseElements(simpleText)
    expect(elements !== null).to.equal(true)

    expect(elements).to.have.length(1)
    expect(elements![0].t).to.equal('text')
    expect(elements![0].v).to.equal('Hello world')
  })

  it('should handle error cases gracefully', () => {
    // Test error handling in parseElements
    const elements = parseElements('')
    expect(elements !== null).to.equal(true)
    expect(elements).to.have.length.greaterThanOrEqual(0)
  })

  it('should convert bot commands not at word boundaries to simple text', () => {
    const text = 'path/help is not a command'
    const elements = parseElements(text)
    expect(elements !== null).to.equal(true)

    const botCommandElements = elements!.filter(
      (el: any) => el.t === 'botcommand'
    )

    expect(botCommandElements).to.have.length(0)

    const textElements = elements!.filter((el: any) => el.t === 'text')
    expect(textElements.length).to.be.greaterThan(0)
    expect(textElements.some((el: any) => el.v.includes('/help'))).to.equal(
      true
    )
  })

  it('should filter other botcommands that are not at a word boundary', () => {
    const testCases = [
      { text: '/help', expectBotCommand: true }, // At start of text
      { text: 'Use /help command', expectBotCommand: true }, // After space
      { text: 'path/help is not a command', expectBotCommand: false },
      { text: 'www.example.com/help', expectBotCommand: false },
    ]

    testCases.forEach(testCase => {
      const { text, expectBotCommand } = testCase
      const elements = parseElements(text)
      expect(elements !== null).to.equal(true)

      const botCommandElements = elements!.filter(
        (el: any) => el.t === 'botcommand'
      )

      if (expectBotCommand) {
        expect(botCommandElements).to.have.length.greaterThan(
          0,
          `Expected bot command to be found in: "${text}"`
        )
        expect(botCommandElements[0].v).to.include('/help')
      } else {
        expect(botCommandElements).to.have.length(
          0,
          `Expected bot command to be filtered out in: "${text}"`
        )
      }
    })
  })
})
