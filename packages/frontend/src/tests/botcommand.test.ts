import * as linkify from 'linkifyjs'
import { botcommand } from '../utils/linkify-plugin-bot-command/index.js'
import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'

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
      expect(linkify.test('/config', 'botcommand')).to.equal(true)
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

    it('Does not work with slashes not at word boundaries', () => {
      expect(linkify.test('test/help', 'botcommand')).to.equal(false)
      expect(linkify.test('path/to/file', 'botcommand')).to.equal(false)
      expect(linkify.test('1/test', 'botcommand')).to.equal(false)
      expect(linkify.test('_/test', 'botcommand')).to.equal(false)
    })

    it('Does not work with double slashes', () => {
      expect(linkify.test('//help', 'botcommand')).to.equal(false)
    })

    it('Does not work with invalid characters', () => {
      expect(linkify.test('/help#invalid', 'botcommand')).to.equal(false)
      expect(linkify.test('/help$invalid', 'botcommand')).to.equal(false)
      expect(linkify.test('/test,', 'botcommand')).to.equal(false)
      expect(linkify.test('/info:details', 'botcommand')).to.equal(false)
      expect(linkify.test('/help-debug=true', 'botcommand')).to.equal(false)
      expect(linkify.test('/config?verbose', 'botcommand')).to.equal(false)
      expect(linkify.test('/warn!critical', 'botcommand')).to.equal(false)
    })
  })
})
