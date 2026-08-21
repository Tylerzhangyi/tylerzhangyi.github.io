'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import PageTransition from '@/components/PageTransition'
import AppLoader from '@/components/AppLoader'
import DetailTransitionBinder from '@/components/DetailTransitionBinder'
import { useUiState } from '@/lib/uiState'
import '@/components/app-shell.css'

export default function AppShell({ children }) {
  const ui = useUiState()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-R6DC0Y49B9', { page_path: pathname })
    }
  }, [pathname])

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content">
        {children}
      </main>
      <PageTransition />
      <DetailTransitionBinder />

      {ui.bootLoading || ui.bootHandoff ? (
        <AppLoader mode="boot" handoff={ui.bootHandoff} />
      ) : null}

      {ui.routeLoading && <AppLoader mode="route" />}
    </div>
  )
}
