'use client'

import { usePageTransition } from '@/lib/pageTransition'

export default function PageTransition() {
  const { phase, originX, originY, revealScale } = usePageTransition()

  if (phase === 'idle') return null

  return (
    <div
      className={`page-transition ${phase === 'primed' ? 'is-primed' : ''} ${phase === 'expanding' ? 'is-expanding' : ''} ${phase === 'holding' ? 'is-holding' : ''} ${phase === 'contracting' ? 'is-contracting' : ''}`}
      aria-hidden="true"
    >
      <div
        className="page-transition__ball"
        style={{
          left: `${originX}px`,
          top: `${originY}px`,
          '--reveal-scale': revealScale
        }}
      />
    </div>
  )
}
