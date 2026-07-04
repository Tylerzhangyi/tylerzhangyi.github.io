'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { lastPointer, setTransitionOrigin } from '@/lib/pageTransition'

function isDetailHref(href) {
  if (!href || href.startsWith('http')) return false
  return href.includes('/projects/') || href.includes('/blog/')
}

function normalizeHref(href) {
  if (!href || href.startsWith('http')) return href
  const path = href.split('?')[0].split('#')[0]
  const suffix = href.slice(path.length)
  const normalized = path.endsWith('/') ? path : `${path}/`
  return `${normalized}${suffix}`
}

export default function DetailTransitionBinder() {
  const router = useRouter()

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
      const href = link.getAttribute('href') || ''
      if (!isDetailHref(href)) return
      setTransitionOrigin(e.clientX, e.clientY)
      router.prefetch(normalizeHref(href))
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [router])

  return null
}
