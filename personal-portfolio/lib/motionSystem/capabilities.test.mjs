import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveMotionMode } from './capabilities.js'

test('reduced wins over desktop signals', () => {
  assert.equal(
    resolveMotionMode({
      reducedMotion: true,
      finePointer: true,
      hoverHover: true,
      width: 1400
    }),
    'reduced'
  )
})

test('desktopFull when fine pointer + hover + wide', () => {
  assert.equal(
    resolveMotionMode({
      reducedMotion: false,
      finePointer: true,
      hoverHover: true,
      width: 1200
    }),
    'desktopFull'
  )
})

test('mobileLite when narrow even with fine pointer', () => {
  assert.equal(
    resolveMotionMode({
      reducedMotion: false,
      finePointer: true,
      hoverHover: true,
      width: 800
    }),
    'mobileLite'
  )
})
