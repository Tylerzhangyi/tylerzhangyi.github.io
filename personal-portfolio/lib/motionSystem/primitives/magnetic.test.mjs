import assert from 'node:assert/strict'
import test from 'node:test'
import { clampPull } from './magnetic.js'

test('clampPull limits vector length to maxPull', () => {
  const { x, y } = clampPull(100, 0, 18)
  assert.ok(Math.hypot(x, y) <= 18 + 1e-6)
})
