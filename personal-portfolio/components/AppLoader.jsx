'use client'

import { useEffect, useState } from 'react'
import './app-loader.css'

/**
 * Endfield-inspired boot:
 * 1) full black screen
 * 2) left solid bar grows top → bottom
 * 3) when full height, expand right to fill
 * 4) fade out
 */
export default function AppLoader({ mode = 'boot', handoff = false }) {
  const isBoot = mode === 'boot'
  const [phase, setPhase] = useState('idle') // idle | drop | expand | hold | out

  useEffect(() => {
    if (!isBoot) return undefined

    setPhase('idle')
    const timers = []
    timers.push(window.setTimeout(() => setPhase('drop'), 80))
    // Bar drop ~900ms, then expand
    timers.push(window.setTimeout(() => setPhase('expand'), 980))
    // Expand ~700ms, brief hold
    timers.push(window.setTimeout(() => setPhase('hold'), 1700))

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [isBoot])

  useEffect(() => {
    if (!isBoot || !handoff) return undefined
    setPhase('out')
    return undefined
  }, [isBoot, handoff])

  if (!isBoot) {
    return (
      <div className="app-loader is-route is-mounted" role="status" aria-label="加载中">
        <div className="boot-scene">
          <div className="boot-route-mark" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={[
        'app-loader',
        'is-boot',
        `is-phase-${phase}`,
        handoff || phase === 'out' ? 'is-handoff' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-label="加载中"
    >
      <div className="boot-scene" aria-hidden="true">
        <div className="boot-black" />
        <div className="boot-blade" />
      </div>
    </div>
  )
}
