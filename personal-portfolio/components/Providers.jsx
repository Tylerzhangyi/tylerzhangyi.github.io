'use client'

import { I18nProvider } from '@/lib/i18n'
import { PageTransitionProvider } from '@/lib/pageTransition'
import { UiStateProvider } from '@/lib/uiState'
import MotionRoot from '@/lib/motionSystem/MotionRoot'
import AppShell from '@/components/AppShell'

export default function Providers({ children }) {
  return (
    <I18nProvider>
      <PageTransitionProvider>
        <UiStateProvider>
          <MotionRoot>
            <AppShell>{children}</AppShell>
          </MotionRoot>
        </UiStateProvider>
      </PageTransitionProvider>
    </I18nProvider>
  )
}
