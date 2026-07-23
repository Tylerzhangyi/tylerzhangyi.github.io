'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { NeoContactTitle, NeoDecorLayer } from '@/components/neo/NeoBrutalScene'
import styles from './contact.module.css'

const CONTACT_LINKS = [
  {
    key: 'email',
    href: 'mailto:Tyler.zhang.cn@hotmail.com',
    external: false,
    variant: 'primary'
  },
  {
    key: 'github',
    href: 'https://github.com/Tylerzhangyi',
    external: true,
    variant: 'dark'
  },
  {
    key: 'gameAccount',
    href: null,
    external: false,
    variant: 'light'
  }
]

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.17-1.11-1.48-1.11-1.48-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .28.18.6.69.5A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 5h14v10H8l-3 3V5z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  )
}

const ICONS = {
  email: MailIcon,
  github: GithubIcon,
  gameAccount: ChatIcon
}

export default function ContactSection() {
  const { t } = useI18n()
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-contact"
      className={styles.contactScroll}
      data-scroll-section="contact"
      data-motion="split"
      aria-label={t('contact.title')}
    >
      <div className={styles.contactPin}>
        <div className={styles.contactGridBg} aria-hidden="true" />
        <NeoDecorLayer active={revealed || inView} />
        <div className={`${styles.contactInner} ${revealed ? styles.contactContentRevealed : ''}`}>
          <div className={styles.contactTitle}>
            <NeoContactTitle title={t('contact.hero')} inView={inView} minimal />
          </div>

          <div className={styles.contactContent}>
            <div className={styles.contactGrid}>
            {CONTACT_LINKS.map((item, index) => {
              const Icon = ICONS[item.key]
              const label = t(`contact.${item.key}`)
              const className = `${styles.contactCard} ${styles[`contactCard${item.variant[0].toUpperCase()}${item.variant.slice(1)}`]}`

              const content = (
                <>
                  <span className={styles.contactCardIcon}>
                    <Icon />
                  </span>
                  <span className={styles.contactCardLabel}>{label}</span>
                  {item.href ? <span className={styles.contactCardArrow}><ArrowIcon /></span> : null}
                </>
              )

              if (!item.href) {
                return (
                  <div
                    key={item.key}
                    className={className}
                    style={{ '--card-delay': `${index * 80}ms` }}
                    data-motion-cascade
                  >
                    {content}
                  </div>
                )
              }

              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={className}
                  style={{ '--card-delay': `${index * 80}ms` }}
                  data-motion-cascade
                  {...(item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {content}
                </a>
              )
            })}
          </div>

          <div className={styles.contactPanel} data-motion-cascade>
            <p className={styles.contactPanelText}>{t('contact.cooperationText')}</p>
          </div>

          <footer className={styles.contactFooter}>
            <span>{t('contact.footerRights')}</span>
          </footer>
          </div>
        </div>
      </div>
    </section>
  )
}
