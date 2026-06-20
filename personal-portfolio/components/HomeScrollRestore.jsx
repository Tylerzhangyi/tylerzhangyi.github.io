'use client'

import { useEffect } from 'react'
import { restoreHomeScroll } from '@/lib/homeScrollRestore'

/** 从详情页返回首页时恢复滚动位置 */
export default function HomeScrollRestore() {
  useEffect(() => {
    restoreHomeScroll()
  }, [])

  return null
}
