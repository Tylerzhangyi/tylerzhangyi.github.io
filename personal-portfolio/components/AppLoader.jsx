'use client'

import { useEffect, useRef, useState } from 'react'
import PixelPacman from '@/components/PixelPacman'
import './app-loader.css'

const PELLET_COUNT = 14

export default function AppLoader({ mode = 'boot', title = 'SYSTEM', text = 'LOADING', progress = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)))
  const target = pct / 100
  const [dash, setDash] = useState(0)
  const targetRef = useRef(target)

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    if (mode !== 'boot') return undefined

    let raf = 0
    const tick = () => {
      setDash((current) => {
        const goal = targetRef.current
        const delta = goal - current
        if (Math.abs(delta) < 0.001) return goal
        return current + delta * 0.14
      })
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [mode])

  const eatenCount = Math.floor(dash * PELLET_COUNT)

  return (
    <div
      className={`app-loader ${mode === 'boot' ? 'is-boot' : 'is-route'} ${mode === 'boot' && pct >= 100 ? 'is-finishing' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="加载中"
    >
      {mode === 'boot' ? (
        <>
          <div className="boot-pixel-bg" aria-hidden="true" />
          <div className="boot-pixel">
            <div className="boot-pixel-frame">
              <p className="boot-pixel-brand">TYLER · ZHANG</p>
              <p className="boot-pixel-status">{text}</p>
              <div className="boot-pacman-scene" aria-hidden="true">
                <div className="boot-pacman-track">
                  {Array.from({ length: PELLET_COUNT }, (_, index) => (
                    <span
                      key={index}
                      className={`boot-pacman-pellet${index < eatenCount ? ' is-eaten' : ''}`}
                      style={{ '--i': index, '--total': PELLET_COUNT - 1 }}
                    />
                  ))}
                  <div className="boot-pacman-runner" style={{ '--dash': dash }}>
                    <PixelPacman />
                  </div>
                </div>
              </div>
              <p className="boot-pixel-pct">{pct}%</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="loader-bg" aria-hidden="true" />
          <div className="loader-noise" aria-hidden="true" />
          <div className="loader-center">
            <div className="mark">
              <div className="mark-ring" aria-hidden="true" />
              <div className="mark-core" aria-hidden="true" />
            </div>
            <div className="text">
              <div className="title">{title}</div>
              <div className="sub">
                <span className="mono">{text}</span>
                <span className="dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
              </div>
            </div>
            <div className="bar" aria-hidden="true">
              <div className="bar-fill" style={{ width: `${progress}%` }} />
              <div className="bar-glow" />
            </div>
          </div>
          <div className="scan" aria-hidden="true" />
        </>
      )}
    </div>
  )
}
