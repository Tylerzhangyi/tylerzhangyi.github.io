'use client'

import { I18nProvider } from '@/lib/i18n'
import { PageTransitionProvider } from '@/lib/pageTransition'
import { UiStateProvider } from '@/lib/uiState'
import AppShell from '@/components/AppShell'

export default function Providers({ children }) {
  return (
    <I18nProvider>
      <PageTransitionProvider>
        <UiStateProvider>
          <AppShell>{children}</AppShell>
        </UiStateProvider>
      </PageTransitionProvider>
    </I18nProvider>
  )
}
