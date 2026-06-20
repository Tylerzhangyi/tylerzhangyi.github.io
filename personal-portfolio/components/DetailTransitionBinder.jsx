'use client'

import { useEffect } from 'react'
import { lastPointer, setTransitionOrigin } from '@/lib/pageTransition'

function isDetailHref(href) {
  if (!href || href.startsWith('http')) return false
  return href.includes('/projects/') || href.includes('/blog/')
}

export default function DetailTransitionBinder() {
  useEffect(() => {
    const onPointerMove = (e) => {
      lastPointer.x = e.clientX
      lastPointer.y = e.clientY
    }

    const onPointerDown = (e) => {
      lastPointer.x = e.clientX
      lastPointer.y = e.clientY

      const link = e.target.closest('a.project-card__link, a.blog-card__link')
      if (!link) return
      if (!isDetailHref(link.getAttribute('href') || '')) return
      setTransitionOrigin(e.clientX, e.clientY)
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [])

  return null
}
