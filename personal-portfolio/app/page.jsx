'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { observeReveals } from '@/lib/motion'
import { bindSectionMotion } from '@/lib/motionSystem/bindSectionMotion'
import { useMotionMode } from '@/lib/motionSystem/MotionRoot'
import { initHomeScrollLayout } from '@/lib/scrollLayout'
import FormStudioHero from '@/components/sections/FormStudioHero'
import IntroWelcomeSection from '@/components/sections/IntroWelcomeSection'
import AboutMeShowcase from '@/components/sections/AboutMeShowcase'
import HomeScrollRestore from '@/components/HomeScrollRestore'
import AboutSection from '@/components/sections/AboutSection'
import EducationSection from '@/components/sections/EducationSection'
import SplitTitleSection from '@/components/sections/SplitTitleSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import BlogSection from '@/components/sections/BlogSection'
import LinksSection from '@/components/sections/LinksSection'
import ContactSection from '@/components/sections/ContactSection'
import '@/components/home.css'

export default function HomePage() {
  const { t, lang } = useI18n()
  const rootRef = useRef(null)
  const motionMode = useMotionMode()

  useEffect(() => {
    const teardown = observeReveals(rootRef.current)
    const teardownLayout = initHomeScrollLayout()
    const sectionNodes = rootRef.current?.querySelectorAll('[data-motion]') ?? []
    const teardownMotion = Array.from(sectionNodes).map((section) =>
      bindSectionMotion(section, motionMode)
    )
    return () => {
      teardown?.()
      teardownLayout?.()
      teardownMotion.forEach((fn) => fn())
    }
  }, [motionMode, lang, t])

  return (
    <div ref={rootRef} className="onepage">
      <HomeScrollRestore />
      <FormStudioHero />

      <IntroWelcomeSection />

      <AboutMeShowcase />

      <section
        id="section-about"
        data-scroll-section="about"
        data-motion="split"
        className="stack-section stack-section--about"
      >
        <AboutSection />
      </section>

      <section
        id="section-education"
        data-scroll-section="education"
        data-motion="split"
        className="stack-section stack-section--solid stack-section--education reveal-fade-only"
      >
        <EducationSection />
      </section>

      <SplitTitleSection
        sectionId="section-projects-intro"
        scrollSection="projects-intro"
        left={t('projectsIntro.left')}
        right={t('projectsIntro.right')}
        ariaLabel={t('projectsIntro.aria')}
        scrollHeight="128vh"
      />

      <ProjectsSection />
      <BlogSection embedded />
      <LinksSection />

      <ContactSection />
    </div>
  )
}
