'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { rememberDetailReturn, usePageTransition } from '@/lib/pageTransition'
import { forceUnlockBodyScroll } from '@/lib/scrollLock'

function normalizeHref(href) {
  if (!href || href.startsWith('http')) return href
  const path = href.split('?')[0].split('#')[0]
  const suffix = href.slice(path.length)
  const normalized = path.endsWith('/') ? path : `${path}/`
  return `${normalized}${suffix}`
}

export default function DetailLink({ href, className, children, ...props }) {
  const router = useRouter()
  const { navigateWithTransition, phase, setTransitionOrigin, setTransitionOriginFromElement } =
    usePageTransition()
  const target = normalizeHref(href)

  const prefetch = useCallback(() => {
    router.prefetch(target)
  }, [router, target])

  const onClick = async (e) => {
    e.preventDefault()
    rememberDetailReturn(target)

    if (e.clientX || e.clientY) {
      setTransitionOrigin(e.clientX, e.clientY)
    } else {
      setTransitionOriginFromElement(e.currentTarget)
    }

    if (phase !== 'idle') {
      router.push(target, { scroll: false })
      return
    }

    try {
      await navigateWithTransition(target, (path) => router.push(path, { scroll: false }))
    } catch {
      forceUnlockBodyScroll()
      router.push(target, { scroll: false })
    }
  }

  return (
    <Link
      href={target}
      className={className}
      onClick={onClick}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      {...props}
    >
      {children}
    </Link>
  )
}
