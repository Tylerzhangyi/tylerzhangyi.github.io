'use client'

import { resolveAssetUrl } from '@/lib/assets'
import './app-loader.css'

const CAR_SPRITE = resolveAssetUrl('photos/boot/racing-car.png')

export default function AppLoader({ mode = 'boot', title = 'SYSTEM', text = 'LOADING', progress = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)))
  const isBoot = mode === 'boot'

  return (
    <div
      className={`app-loader ${isBoot ? 'is-boot' : 'is-route'} ${isBoot && pct >= 100 ? 'is-finishing' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="加载中"
    >
      <div className="car-loader" aria-hidden="true">
        <div className="car-world">
          <span className="car-cloud car-cloud-a" />
          <span className="car-cloud car-cloud-b" />
          <span className="car-ground" />
          <span className="car-road-shine" />
          <span className="car-obstacle car-obstacle-a" />
          <span className="car-obstacle car-obstacle-b" />
          <span className="car-obstacle car-obstacle-c" />
          <div className="pixel-car" style={{ '--run': pct / 100 }}>
            <img src={CAR_SPRITE} alt="" draggable={false} />
          </div>
        </div>
      </div>
    </div>
  )
}
