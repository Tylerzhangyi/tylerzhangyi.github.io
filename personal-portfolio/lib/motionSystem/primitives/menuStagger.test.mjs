import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MENU_STAGGER_CLOSE_MS,
  MENU_STAGGER_GAP,
  staggerMenuClose,
  staggerMenuOpen
} from './menuStagger.js'

test('MENU_STAGGER_CLOSE_MS stays within MENU_ANIM_MS contract (≤220)', () => {
  assert.ok(MENU_STAGGER_CLOSE_MS <= 220)
  assert.ok(MENU_STAGGER_CLOSE_MS > 0)
})

test('MENU_STAGGER_GAP is 0.05s', () => {
  assert.equal(MENU_STAGGER_GAP, 0.05)
})

test('staggerMenuOpen no-ops on empty targets and returns cleanup', () => {
  const cleanup = staggerMenuOpen([])
  assert.equal(typeof cleanup, 'function')
  cleanup()
})

test('staggerMenuClose no-ops on empty targets and returns cleanup', () => {
  const cleanup = staggerMenuClose([])
  assert.equal(typeof cleanup, 'function')
  cleanup()
})

test('staggerMenuOpen uses from y:24 opacity:0 with stagger and expo.out', () => {
  const calls = []
  const fakeTween = { kill() {} }
  const gsap = {
    fromTo(targets, from, to) {
      calls.push({ targets, from, to })
      return fakeTween
    },
    killTweensOf() {}
  }
  const els = [{}, {}]
  const cleanup = staggerMenuOpen(els, { gsap })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].targets.length, 2)
  assert.deepEqual(calls[0].from, { y: 24, opacity: 0 })
  assert.equal(calls[0].to.y, 0)
  assert.equal(calls[0].to.opacity, 1)
  assert.equal(calls[0].to.stagger, 0.05)
  assert.equal(calls[0].to.ease, 'expo.out')
  cleanup()
})

test('staggerMenuClose animates opacity/y out within ≤220ms', () => {
  const calls = []
  const fakeTween = { kill() {} }
  const gsap = {
    to(targets, vars) {
      calls.push({ targets, vars })
      return fakeTween
    },
    killTweensOf() {}
  }
  const els = [{}]
  const cleanup = staggerMenuClose(els, { gsap })
  assert.equal(calls.length, 1)
  assert.ok(calls[0].vars.duration * 1000 <= 220)
  assert.equal(calls[0].vars.opacity, 0)
  assert.ok('y' in calls[0].vars)
  cleanup()
})
