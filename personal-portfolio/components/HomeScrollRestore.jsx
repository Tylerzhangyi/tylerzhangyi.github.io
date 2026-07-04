'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  clearSavedHomeScroll,
  consumePendingSection,
  getHashSection,
  isHomePath,
  restoreHomeScroll
} from '@/lib/homeScrollRestore'
import { refreshScrollLayoutNow } from '@/lib/scrollLayout'
import { scrollToSection, sectionHash } from '@/lib/scrollToSection'

/** 从详情页返回首页时恢复滚动，或跳转到 hash / 菜单目标区块 */
export default function HomeScrollRestore() {
  const pathname = usePathname()

  useEffect(() => {
    if (!isHomePath(pathname)) return

    const target = consumePendingSection() || getHashSection()

    if (target && target !== 'home') {
      clearSavedHomeScroll()
      window.history.replaceState(null, '', sectionHash(target))

      const run = () => {
        refreshScrollLayoutNow()
        scrollToSection(target, 'auto')
        window.dispatchEvent(new Event('scroll'))
      }

      requestAnimationFrame(() => {
        run()
        window.setTimeout(run, 180)
        window.setTimeout(run, 480)
        window.setTimeout(run, 900)
        window.setTimeout(run, 1400)
      })
      return
    }

    if (!getHashSection()) {
      restoreHomeScroll()
    }
  }, [pathname])

  return null
}
