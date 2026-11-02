import { expect } from 'chai'
import { describe, it } from 'mocha'

import { getImageDisplaySize } from '../components/attachment/imageDisplaySize.js'

type Case = [width: number, height: number, displayW: number, displayH: number]

function expectSizes(cases: Case[]) {
  for (const [w, h, displayW, displayH] of cases) {
    const { width, height } = getImageDisplaySize(w, h)
    expect([width, height], `${w}x${h}`).to.deep.equal([displayW, displayH])
  }
}

describe('getImageDisplaySize', () => {
  it('scales typical ratios without cropping', () => {
    const cases: Case[] = [
      [4000, 4000, 450, 450],
      [480, 480, 450, 450],
      [4000, 3000, 450, 338],
      [1280, 720, 450, 253],
      [4000, 1800, 450, 203],
      [3000, 4000, 338, 450],
      [720, 1280, 253, 450],
      [576, 1280, 203, 450],
      [300, 200, 300, 200],
    ]
    expectSizes(cases)
    for (const [w, h] of cases) {
      expect(getImageDisplaySize(w, h).visibleFraction, `${w}x${h}`).to.equal(1)
    }
  })

  it('scales small images up to the minimum width', () => {
    expectSizes([
      [48, 48, 200, 200],
      [48, 36, 200, 150],
      [160, 90, 200, 113],
      [36, 48, 200, 267],
      [90, 160, 200, 356],
    ])
  })

  it('crops wide images to 4:1', () => {
    expectSizes([
      [2000, 500, 450, 113],
      [2000, 400, 450, 113],
      [2000, 50, 450, 113],
      [160, 16, 200, 50],
    ])
    expect(getImageDisplaySize(2000, 400).visibleFraction).to.be.closeTo(
      0.8,
      0.001
    )
  })

  it('crops tall images to 200x450', () => {
    expectSizes([
      [667, 2000, 200, 450],
      [50, 2000, 200, 450],
      // small tall images must not grow higher than the maximum
      [20, 200, 200, 450],
      [40, 400, 200, 450],
    ])
  })

  it('reports a crop only for ratios outside of the allowed range', () => {
    const isCropped = (w: number, h: number) =>
      getImageDisplaySize(w, h).visibleFraction < 1
    expect(isCropped(2000, 500)).to.equal(false)
    expect(isCropped(2001, 500)).to.equal(true)
    expect(isCropped(2000, 200)).to.equal(true)
    expect(isCropped(200, 450)).to.equal(false)
    expect(isCropped(67, 200)).to.equal(true)
    expect(isCropped(1080, 2520)).to.equal(true)
  })

  it('uses a default size for unknown dimensions', () => {
    expect(getImageDisplaySize(0, 0)).to.deep.equal({
      width: 200,
      height: 200,
      visibleFraction: 1,
    })
    expect(getImageDisplaySize(500, 0).width).to.equal(200)
  })
})
