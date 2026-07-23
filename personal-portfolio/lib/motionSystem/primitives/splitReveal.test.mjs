import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import {
  tokenizeWords,
  tokenizeChars,
  splitTextElement,
  readSplitSourceText,
  shouldSkipLegacyReveal,
  resolveCascadeIndex,
  computeMountCascadeDelay,
  MOUNT_CASCADE_DURATION,
  MOUNT_CASCADE_MAX_TOTAL_MS
} from './splitReveal.js'

test('readSplitSourceText joins element children with spaces', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const { document } = dom.window
  const h1 = document.createElement('h1')
  const s1 = document.createElement('span')
  s1.textContent = 'Hello'
  const s2 = document.createElement('span')
  s2.textContent = 'World'
  h1.append(s1, s2)
  assert.equal(readSplitSourceText(h1), 'Hello World')
})

test('splitTextElement keeps React-owned children and only mutates overlay host', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const { document } = dom.window
  const h1 = document.createElement('h1')
  h1.setAttribute('data-split', 'words')
  const s1 = document.createElement('span')
  s1.textContent = 'Hello'
  const s2 = document.createElement('span')
  s2.textContent = 'World'
  h1.append(s1, s2)
  document.body.append(h1)

  const { words, revert } = splitTextElement(h1, { type: 'words' })
  assert.equal(words.length, 2)
  assert.equal(s1.isConnected, true)
  assert.equal(s2.isConnected, true)
  assert.equal(s1.parentNode, h1)
  assert.equal(h1.contains(s1), true)
  assert.ok(h1.classList.contains('motion-split-active'))
  const host = h1.querySelector('.motion-split-host')
  assert.ok(host)
  assert.equal(host.getAttribute('aria-hidden'), 'true')

  // Simulate React still owning the original nodes
  assert.doesNotThrow(() => h1.removeChild(s1))
  h1.insertBefore(s1, host)

  revert()
  assert.equal(h1.querySelector('.motion-split-host'), null)
  assert.equal(h1.classList.contains('motion-split-active'), false)
  assert.equal(s1.parentNode, h1)
  assert.equal(s2.parentNode, h1)
})

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

test('resolveCascadeIndex prefers options.index', () => {
  const el = { style: { getPropertyValue: () => '2' } }
  assert.equal(resolveCascadeIndex(el, { index: 1 }), 1)
})

test('resolveCascadeIndex reads --motion-cascade-i from style', () => {
  const el = { style: { getPropertyValue: (name) => (name === '--motion-cascade-i' ? ' 3 ' : '') } }
  assert.equal(resolveCascadeIndex(el), 3)
})

test('resolveCascadeIndex defaults to 0', () => {
  const el = { style: { getPropertyValue: () => '' } }
  assert.equal(resolveCascadeIndex(el), 0)
})

test('computeMountCascadeDelay keeps total within budget', () => {
  for (let index = 0; index < 12; index += 1) {
    const delay = computeMountCascadeDelay(index)
    const totalMs = (delay + MOUNT_CASCADE_DURATION) * 1000
    assert.ok(totalMs <= MOUNT_CASCADE_MAX_TOTAL_MS + 1)
  }
})

test('computeMountCascadeDelay increases with index then caps', () => {
  assert.equal(computeMountCascadeDelay(0), 0)
  assert.ok(computeMountCascadeDelay(3) > computeMountCascadeDelay(1))
  assert.equal(computeMountCascadeDelay(20), computeMountCascadeDelay(8))
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
