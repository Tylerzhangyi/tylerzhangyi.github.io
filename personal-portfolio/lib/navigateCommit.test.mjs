import assert from 'node:assert/strict'
import test from 'node:test'

import {
  commitClientNavigation,
  normalizePathname,
  waitForPathname
} from './navigateCommit.js'

test('normalizePathname strips trailing slash and query/hash', () => {
  assert.equal(normalizePathname('/projects/1/'), '/projects/1')
  assert.equal(normalizePathname('/projects/1/?x=1#y'), '/projects/1')
  assert.equal(normalizePathname('/'), '/')
  assert.equal(normalizePathname(''), '/')
})

test('waitForPathname resolves true when path becomes target', async () => {
  let path = '/'
  const ok = await waitForPathname('/projects/1/', {
    timeoutMs: 500,
    getPathname: () => path,
    now: (() => {
      let t = 0
      return () => {
        t += 16
        return t
      }
    })(),
    schedule: (fn) => {
      path = '/projects/1/'
      queueMicrotask(fn)
    }
  })
  assert.equal(ok, true)
})

test('waitForPathname resolves false on timeout when path never changes', async () => {
  const ok = await waitForPathname('/projects/1/', {
    timeoutMs: 50,
    getPathname: () => '/',
    now: (() => {
      let t = 0
      return () => {
        t += 20
        return t
      }
    })(),
    schedule: (fn) => queueMicrotask(fn)
  })
  assert.equal(ok, false)
})

test('commitClientNavigation falls back to hard assign when soft nav never commits', async () => {
  const pushes = []
  const assigns = []
  const result = await commitClientNavigation(
    '/projects/1/',
    (href) => {
      pushes.push(href)
    },
    {
      timeoutMs: 40,
      getPathname: () => '/',
      assign: (url) => assigns.push(url),
      now: (() => {
        let t = 0
        return () => {
          t += 20
          return t
        }
      })(),
      schedule: (fn) => queueMicrotask(fn)
    }
  )
  assert.equal(result, 'hard')
  assert.deepEqual(pushes, ['/projects/1/'])
  assert.deepEqual(assigns, ['/projects/1/'])
})

test('commitClientNavigation returns soft when path commits', async () => {
  let path = '/'
  const assigns = []
  const result = await commitClientNavigation(
    '/blog/1/',
    () => {
      path = '/blog/1/'
    },
    {
      timeoutMs: 200,
      getPathname: () => path,
      assign: (url) => assigns.push(url),
      now: (() => {
        let t = 0
        return () => {
          t += 16
          return t
        }
      })(),
      schedule: (fn) => queueMicrotask(fn)
    }
  )
  assert.equal(result, 'soft')
  assert.deepEqual(assigns, [])
})
