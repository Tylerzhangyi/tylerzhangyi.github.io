'use client'

import './app-loader.css'

const BOOT_TITLE = 'tyler zhang'

export default function AppLoader({ mode = 'boot', progress = 0, handoff = false }) {
  const isBoot = mode === 'boot'
  const reveal = progress >= 28

  return (
    <div
      className={`app-loader ${isBoot ? 'is-boot' : 'is-route'} ${handoff ? 'is-handoff' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="加载中"
    >
      <div className="boot-scene" aria-hidden="true">
        <div className="boot-grid" />

        <div className={`boot-content ${reveal ? 'is-revealed' : ''}`}>
          <div className="boot-mark" aria-hidden="true">
            <span className="boot-mark-line" />
          </div>

          <p className="boot-title">{BOOT_TITLE}</p>

          <div className="boot-bar">
            <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
