'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BoltIcon,
  BookOpenIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { useI18n } from '@/lib/i18n'
import '@/styles/links-drag-lock.css'
import styles from './links.module.css'

const SCATTER_LAYOUT = [
  { x: 4, y: 10, r: -6, z: 2 },
  { x: 38, y: 4, r: 5, z: 4 },
  { x: 72, y: 12, r: -7.5, z: 1 },
  { x: 6, y: 38, r: 7, z: 3 },
  { x: 46, y: 32, r: -4, z: 6 },
  { x: 76, y: 40, r: 6, z: 2 },
  { x: 2, y: 62, r: -5.5, z: 3 },
  { x: 36, y: 68, r: 3, z: 5 },
  { x: 70, y: 60, r: -4.5, z: 4 }
]

const CARD_ACCENTS = [
  '#3b82f6',
  '#8b5cf6',
  '#0ea5e9',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#64748b'
]

const STORAGE_KEY = 'portfolio-links-scatter-v3'
const DRAG_THRESHOLD = 5
const OVERFLOW_RATIO = 0.4

const ICON_MAP = {
  BoltIcon,
  BookOpenIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  LinkIcon
}

export default function LinksSection() {
  const { t, getDict, lang } = useI18n()
  const canvasRef = useRef(null)

  const [cardPositions, setCardPositions] = useState([])
  const [dragState, setDragState] = useState(null)
  const [clickBlockIndex, setClickBlockIndex] = useState(-1)
  const [dragEnabled, setDragEnabled] = useState(true)

  const dragStateRef = useRef(null)
  const scrollLockedRef = useRef(false)
  const savedScrollYRef = useRef(0)
  const dragShieldRef = useRef(null)
  const onWheelPreventRef = useRef(null)
  const onTouchMovePreventRef = useRef(null)

  const linksList = useMemo(() => {
    const links = getDict('links.linksList') || []
    const iconMap = [
      'CodeBracketIcon',
      'BookOpenIcon',
      'CodeBracketIcon',
      'QuestionMarkCircleIcon',
      'RocketLaunchIcon',
      'PaintBrushIcon',
      'LinkIcon',
      'LinkIcon',
      'LinkIcon'
    ]
    const urlMap = {
      zh: [
        'https://github.com/Yungu-HZ-Highschool/',
        'https://eric.mojalab.cn/',
        'https://github.com/',
        'https://stackoverflow.com/',
        'https://cn.vitejs.dev/',
        'https://css-tricks.com/',
        'https://wraje.github.io/',
        'https://mathewmsj.github.io/',
        'https://dengruihan.github.io/'
      ],
      en: [
        'https://github.com/Yungu-HZ-Highschool',
        'https://eric.mojalab.cn/',
        'https://github.com/',
        'https://stackoverflow.com/',
        'https://vitejs.dev/',
        'https://css-tricks.com/',
        'https://wraje.github.io/',
        'https://mathewmsj.github.io/',
        'https://dengruihan.github.io/'
      ]
    }
    return links.map((link, index) => ({
      ...link,
      icon: iconMap[index] || 'LinkIcon',
      url: urlMap[lang][index] || urlMap.en[index]
    }))
  }, [getDict, lang])

  const initPositions = useCallback(() => {
    const count = linksList.length
    let loaded = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) loaded = JSON.parse(raw)
    } catch {
      // ignore
    }
    if (Array.isArray(loaded) && loaded.length === count) {
      setCardPositions(
        loaded.map((p, i) => ({
          ...(SCATTER_LAYOUT[i] || SCATTER_LAYOUT[0]),
          ...p
        }))
      )
    } else {
      setCardPositions(SCATTER_LAYOUT.slice(0, count).map((p) => ({ ...p })))
    }
  }, [linksList.length])

  const savePositions = useCallback((positions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
    } catch {
      // ignore
    }
  }, [])

  const getCanvasRect = useCallback(() => {
    return canvasRef.current?.getBoundingClientRect()
  }, [])

  const clampPosition = useCallback(
    (xPct, yPct, cardEl) => {
      const canvas = getCanvasRect()
      if (!canvas || !cardEl) return { x: xPct, y: yPct }

      const cardW = cardEl.offsetWidth
      const cardH = cardEl.offsetHeight
      const wPct = (cardW / canvas.width) * 100
      const hPct = (cardH / canvas.height) * 100
      const padX = wPct * OVERFLOW_RATIO
      const padY = hPct * OVERFLOW_RATIO

      return {
        x: Math.min(100 - wPct + padX, Math.max(-padX, xPct)),
        y: Math.min(100 - hPct + padY, Math.max(-padY, yPct))
      }
    },
    [getCanvasRect]
  )

  const lockPageScroll = useCallback(() => {
    if (scrollLockedRef.current) return
    scrollLockedRef.current = true
    savedScrollYRef.current = window.scrollY
    document.documentElement.classList.add('scatter-drag-lock')
    document.body.classList.add('scatter-drag-lock')
  }, [])

  const unlockPageScroll = useCallback(() => {
    if (!scrollLockedRef.current) return
    document.documentElement.classList.remove('scatter-drag-lock')
    document.body.classList.remove('scatter-drag-lock')
    window.scrollTo(0, savedScrollYRef.current)
    scrollLockedRef.current = false
  }, [])

  const setupDragShield = useCallback(() => {
    if (dragShieldRef.current) return
    dragShieldRef.current = (ev) => ev.preventDefault()
    document.documentElement.classList.add('scatter-drag-lock')
    document.body.classList.add('scatter-drag-lock')
    document.addEventListener('selectstart', dragShieldRef.current, true)
    document.addEventListener('dragstart', dragShieldRef.current, true)
    onWheelPreventRef.current = (ev) => ev.preventDefault()
    document.addEventListener('wheel', onWheelPreventRef.current, { passive: false })
    onTouchMovePreventRef.current = (ev) => ev.preventDefault()
    document.addEventListener('touchmove', onTouchMovePreventRef.current, { passive: false })
  }, [])

  const teardownDragShield = useCallback(() => {
    document.documentElement.classList.remove('scatter-drag-lock')
    document.body.classList.remove('scatter-drag-lock')
    if (dragShieldRef.current) {
      document.removeEventListener('selectstart', dragShieldRef.current, true)
      document.removeEventListener('dragstart', dragShieldRef.current, true)
      dragShieldRef.current = null
    }
    if (onWheelPreventRef.current) {
      document.removeEventListener('wheel', onWheelPreventRef.current)
      onWheelPreventRef.current = null
    }
    if (onTouchMovePreventRef.current) {
      document.removeEventListener('touchmove', onTouchMovePreventRef.current)
      onTouchMovePreventRef.current = null
    }
  }, [])

  const releaseCardFocus = useCallback((cardEl) => {
    cardEl?.querySelector?.(`.${styles.scatterCardCta}`)?.blur?.()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [])

  const beginDrag = useCallback((e, index, { preventNow = false } = {}) => {
    const cardEl = e.currentTarget?.closest?.(`.${styles.scatterCard}`)
    if (!cardEl) return

    if (preventNow) e.preventDefault()

    const state = {
      index,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: cardPositions[index]?.x ?? 0,
      originY: cardPositions[index]?.y ?? 0,
      moved: false,
      cardEl
    }
    dragStateRef.current = state
    setDragState(state)

    try {
      cardEl.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }, [cardPositions])

  const onGripPointerDown = useCallback(
    (e, index) => {
      if (!dragEnabled || e.button !== 0) return
      beginDrag(e, index, { preventNow: true })
    },
    [dragEnabled, beginDrag]
  )

  const onCardPointerDown = useCallback(
    (e, index) => {
      if (!dragEnabled || e.button !== 0) return
      if (e.target.closest(`.${styles.scatterCardGrip}, .${styles.scatterCardCta}`)) return
      beginDrag(e, index)
    },
    [dragEnabled, beginDrag]
  )

  const onPointerMove = useCallback(
    (e) => {
      const state = dragStateRef.current
      if (!state || e.pointerId !== state.pointerId) return

      e.preventDefault()

      const { index, startX, startY, originX, originY, cardEl } = state
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      if (!state.moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        state.moved = true
        setDragState({ ...state })
        lockPageScroll()
        setupDragShield()
      }

      const canvas = getCanvasRect()
      if (!canvas) return

      const originLeftPx = (originX / 100) * canvas.width
      const originTopPx = (originY / 100) * canvas.height
      const nextX = ((originLeftPx + dx) / canvas.width) * 100
      const nextY = ((originTopPx + dy) / canvas.height) * 100
      const clamped = clampPosition(nextX, nextY, cardEl)

      setCardPositions((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], x: clamped.x, y: clamped.y }
        return next
      })
    },
    [clampPosition, getCanvasRect, lockPageScroll, setupDragShield]
  )

  const onPointerUp = useCallback(
    (e) => {
      const state = dragStateRef.current
      if (!state || e.pointerId !== state.pointerId) return

      const { index, moved, cardEl } = state

      try {
        cardEl?.releasePointerCapture?.(e.pointerId)
      } catch {
        // ignore
      }

      if (moved) {
        setCardPositions((prev) => {
          savePositions(prev)
          return prev
        })
        setClickBlockIndex(index)
        releaseCardFocus(cardEl)
        window.setTimeout(() => setClickBlockIndex(-1), 120)
      }

      dragStateRef.current = null
      setDragState(null)
      teardownDragShield()
      unlockPageScroll()
    },
    [releaseCardFocus, savePositions, teardownDragShield, unlockPageScroll]
  )

  const onVisitClick = useCallback((e, index) => {
    if (clickBlockIndex === index) e.preventDefault()
  }, [clickBlockIndex])

  const getIconComponent = useCallback((iconName) => {
    return ICON_MAP[iconName] || LinkIcon
  }, [])

  const cardLayout = useCallback(
    (index) => {
      const layout = cardPositions[index] ?? SCATTER_LAYOUT[index] ?? SCATTER_LAYOUT[0]
      const dragging = dragState?.index === index
      return {
        '--card-rotate': `${layout.r}deg`,
        '--card-accent': CARD_ACCENTS[index % CARD_ACCENTS.length],
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        zIndex: dragging ? 200 : layout.z
      }
    },
    [cardPositions, dragState]
  )

  useEffect(() => {
    initPositions()
    setDragEnabled(!window.matchMedia('(max-width: 820px)').matches)

    const onResize = () => {
      setDragEnabled(!window.matchMedia('(max-width: 820px)').matches)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [initPositions])

  useEffect(() => {
    initPositions()
  }, [lang, initPositions])

  useEffect(() => {
    if (!dragState) return undefined

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [dragState, onPointerMove, onPointerUp])

  useEffect(() => {
    return () => {
      teardownDragShield()
      unlockPageScroll()
    }
  }, [teardownDragShield, unlockPageScroll])

  return (
    <section id="section-links" data-scroll-section="links" className="links-scroll">
      <div className={`links-scroll__scatter links-scroll__content ${styles.linksPage} page`}>
        <div
          ref={canvasRef}
          className={`${styles.scatterCanvas} ${dragState?.moved ? styles.isDragActive : ''}`}
          aria-label="链接卡片"
        >
          <header className={styles.scatterHeader}>
            <p className={styles.scatterKicker}>{t('links.kicker')}</p>
            <h1 className={styles.scatterTitle}>{t('links.title')}</h1>
            <p className={styles.scatterHint}>{t('links.dragHint')}</p>
          </header>

          {linksList.map((link, index) => {
            const Icon = getIconComponent(link.icon)
            return (
              <article
                key={`${link.title}-${index}`}
                className={`${styles.scatterCard} ${dragState?.moved && dragState?.index === index ? styles.isDragging : ''}`}
                style={cardLayout(index)}
                onPointerDownCapture={(e) => onCardPointerDown(e, index)}
                onDragStartCapture={(e) => e.preventDefault()}
              >
                <div className={styles.scatterCardTilt}>
                  <button
                    type="button"
                    className={styles.scatterCardGrip}
                    aria-label={t('links.dragHint')}
                    onPointerDown={(e) => onGripPointerDown(e, index)}
                  >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </button>
                  <div className={styles.scatterCardBody}>
                    <span className={styles.scatterCardAccent} aria-hidden="true" />
                    <div className={styles.scatterCardIcon}>
                      <Icon />
                    </div>
                    <h3 className={styles.scatterCardTitle}>{link.title}</h3>
                    <p className={styles.scatterCardDesc}>{link.description}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.scatterCardCta}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => onVisitClick(e, index)}
                    >
                      {t('links.visit')}
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
