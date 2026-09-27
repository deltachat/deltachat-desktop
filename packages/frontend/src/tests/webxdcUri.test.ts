import { expect } from 'chai'
import { describe, it } from 'mocha'

import { parseWebxdcUri } from '../utils/webxdcUri.js'

describe('parseWebxdcUri', () => {
  it('parses account and message id', () => {
    expect(parseWebxdcUri('dcwebxdc:1/1234')).to.deep.equal({
      accountId: 1,
      msgId: 1234,
    })
  })

  it('is case insensitive regarding the scheme', () => {
    expect(parseWebxdcUri('DCWEBXDC:2/42')).to.deep.equal({
      accountId: 2,
      msgId: 42,
    })
  })

  it('accepts a trailing slash', () => {
    expect(parseWebxdcUri('dcwebxdc:1/42/')).to.deep.equal({
      accountId: 1,
      msgId: 42,
    })
  })

  it('rejects other schemes and malformed URIs', () => {
    for (const uri of [
      'openpgp4fpr:ABC#a=b',
      'dcwebxdc:',
      'dcwebxdc:1',
      'dcwebxdc:1/',
      'dcwebxdc:a/1',
      'dcwebxdc:1/1/1',
      'dcwebxdc:-1/1',
      'dcwebxdc:1/1?href=/x',
      'xdcwebxdc:1/1',
    ]) {
      expect(parseWebxdcUri(uri), uri).to.equal(null)
    }
  })
})
