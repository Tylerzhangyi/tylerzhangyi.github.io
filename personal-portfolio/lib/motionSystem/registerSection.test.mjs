import assert from 'node:assert/strict'
import test from 'node:test'
import { elementHasMotionFlag, parseMotionFlags } from './registerSection.js'

test('parseMotionFlags returns empty set for missing value', () => {
  assert.deepEqual(parseMotionFlags(undefined), new Set())
  assert.deepEqual(parseMotionFlags(null), new Set())
  assert.deepEqual(parseMotionFlags(''), new Set())
})

test('parseMotionFlags ignores non-string values', () => {
  assert.deepEqual(parseMotionFlags(42), new Set())
})

test('parseMotionFlags parses allowed comma-separated flags', () => {
  assert.deepEqual(
    parseMotionFlags('split, parallax, tilt'),
    new Set(['split', 'parallax', 'tilt'])
  )
})

test('parseMotionFlags ignores unknown flags', () => {
  assert.deepEqual(parseMotionFlags('split, unknown, magnetic'), new Set(['split', 'magnetic']))
})

test('elementHasMotionFlag checks data-motion attribute', () => {
  const el = {
    getAttribute(name) {
      return name === 'data-motion' ? 'split, magnetic' : null
    }
  }
  assert.equal(elementHasMotionFlag(el, 'split'), true)
  assert.equal(elementHasMotionFlag(el, 'parallax'), false)
})

test('elementHasMotionFlag returns false for invalid elements', () => {
  assert.equal(elementHasMotionFlag(null, 'split'), false)
  assert.equal(elementHasMotionFlag({}, 'split'), false)
})
