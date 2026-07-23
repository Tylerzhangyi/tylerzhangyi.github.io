import assert from 'node:assert/strict'
import test from 'node:test'
import {
  tokenizeWords,
  tokenizeChars,
  shouldSkipLegacyReveal
} from './splitReveal.js'

test('tokenizeWords splits on whitespace', () => {
  assert.deepEqual(tokenizeWords('Hello world'), ['Hello', 'world'])
})

test('tokenizeWords returns single word for one token', () => {
  assert.deepEqual(tokenizeWords('Hello'), ['Hello'])
})

test('tokenizeWords trims and collapses whitespace', () => {
  assert.deepEqual(tokenizeWords('  Hello   world  '), ['Hello', 'world'])
})

test('tokenizeWords returns empty array for empty input', () => {
  assert.deepEqual(tokenizeWords(''), [])
  assert.deepEqual(tokenizeWords('   '), [])
  assert.deepEqual(tokenizeWords(null), [])
})

test('tokenizeChars splits into grapheme units', () => {
  assert.deepEqual(tokenizeChars('Hello'), ['H', 'e', 'l', 'l', 'o'])
})

test('tokenizeChars returns empty array for empty input', () => {
  assert.deepEqual(tokenizeChars(''), [])
  assert.deepEqual(tokenizeChars(undefined), [])
})

test('shouldSkipLegacyReveal is true when element has split flag', () => {
  const el = {
    getAttribute(name) {
      return name === 'data-motion' ? 'split' : null
    },
    closest() {
      return null
    },
    matches() {
      return false
    },
    classList: { contains: () => false }
  }
  assert.equal(shouldSkipLegacyReveal(el), true)
})

test('shouldSkipLegacyReveal is true for heading inside split section', () => {
  const section = {
    getAttribute(name) {
      return name === 'data-motion' ? 'split,parallax' : null
    }
  }
  const el = {
    getAttribute() {
      return null
    },
    closest(sel) {
      return sel === '[data-motion]' ? section : null
    },
    matches(sel) {
      return sel === '[data-split], h1, h2, h3, [data-motion-cascade]'
    },
    classList: { contains: () => false }
  }
  assert.equal(shouldSkipLegacyReveal(el), true)
})

test('shouldSkipLegacyReveal is false for unrelated nodes', () => {
  const el = {
    getAttribute() {
      return null
    },
    closest() {
      return null
    },
    matches() {
      return false
    },
    classList: { contains: () => false }
  }
  assert.equal(shouldSkipLegacyReveal(el), false)
})
