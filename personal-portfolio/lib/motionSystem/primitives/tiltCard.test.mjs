import assert from 'node:assert/strict'
import test from 'node:test'
import { computeTilt } from './tiltCard.js'

test('computeTilt caps degrees at corners', () => {
  const t = computeTilt({ px: 0, py: 0, width: 200, height: 200, maxDeg: 10, maxShift: 12 })
  assert.ok(Math.abs(t.rotateX) <= 10 + 1e-6)
  assert.ok(Math.abs(t.rotateY) <= 10 + 1e-6)
  assert.ok(Math.abs(t.x) <= 12 + 1e-6)
  assert.ok(Math.abs(t.y) <= 12 + 1e-6)
})

test('computeTilt is neutral at center', () => {
  const t = computeTilt({ px: 100, py: 100, width: 200, height: 200, maxDeg: 10, maxShift: 12 })
  assert.ok(Math.abs(t.rotateX) < 1e-6)
  assert.ok(Math.abs(t.rotateY) < 1e-6)
  assert.ok(Math.abs(t.x) < 1e-6)
  assert.ok(Math.abs(t.y) < 1e-6)
})

test('computeTilt mirrors pointer offset', () => {
  const right = computeTilt({ px: 180, py: 100, width: 200, height: 200, maxDeg: 10, maxShift: 12 })
  const left = computeTilt({ px: 20, py: 100, width: 200, height: 200, maxDeg: 10, maxShift: 12 })
  assert.ok(right.rotateY > 0)
  assert.ok(left.rotateY < 0)
})
