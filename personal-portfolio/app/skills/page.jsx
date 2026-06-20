'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import styles from '@/components/pages/skills.module.css'

const CHART_SIZE = 500
const CENTER_X = 250
const CENTER_Y = 250
const RADIUS = 138
const GRID_LEVELS = [0.2, 0.4, 0.6, 0.8, 1.0]
const LABEL_OFFSET = 44

function getGridPolygonPoints(level, skillCount, angleStep) {
  const points = []
  for (let i = 0; i < skillCount; i += 1) {
    const angle = i * angleStep - Math.PI / 2
    const r = RADIUS * level
    const x = CENTER_X + r * Math.cos(angle)
    const y = CENTER_Y + r * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

function buildSkillPoints(skillsList, angleStep) {
  return skillsList.map((skill, index) => {
    const angle = index * angleStep - Math.PI / 2
    const level = skill.level / 100
    const r = RADIUS * level
    return {
      x: CENTER_X + r * Math.cos(angle),
      y: CENTER_Y + r * Math.sin(angle),
      angle
    }
  })
}

function buildSkillLabels(skillsList, angleStep) {
  return skillsList.map((skill, index) => {
    const angle = index * angleStep - Math.PI / 2
    const labelRadius = RADIUS + LABEL_OFFSET
    let x = CENTER_X + labelRadius * Math.cos(angle)
    let y = CENTER_Y + labelRadius * Math.sin(angle)

    let anchor = 'middle'
    let baseline = 'middle'

    if (Math.abs(Math.cos(angle)) < 0.1) {
      anchor = 'middle'
      if (Math.sin(angle) > 0) {
        baseline = 'hanging'
        y += 5
      } else {
        baseline = 'auto'
        y -= 5
      }
    } else if (Math.cos(angle) > 0) {
      anchor = 'start'
      x += 25
      baseline = 'middle'
    } else {
      anchor = 'end'
      x -= 25
      baseline = 'middle'
    }

    return { x, y, text: skill.name, anchor, baseline }
  })
}

function buildSkillValueLabels(skillsList, angleStep) {
  return skillsList.map((skill, index) => {
    const angle = index * angleStep - Math.PI / 2
    const level = skill.level / 100
    const r = RADIUS * level
    const valueRadius = r - 15
    const x = CENTER_X + valueRadius * Math.cos(angle)
    const y = CENTER_Y + valueRadius * Math.sin(angle)

    let anchor = 'middle'
    const baseline = 'middle'

    if (Math.abs(Math.cos(angle)) < 0.1) {
      anchor = 'middle'
    } else if (Math.cos(angle) > 0) {
      anchor = 'start'
    } else {
      anchor = 'end'
    }

    return { x, y, text: skill.level, anchor, baseline }
  })
}

export default function SkillsPage() {
  const { t, getDict } = useI18n()
  const [chartLoaded, setChartLoaded] = useState(false)

  const skillsList = useMemo(() => getDict('skills.skillsList') || [], [getDict])
  const sortedSkills = useMemo(
    () => [...skillsList].sort((a, b) => b.level - a.level),
    [skillsList]
  )
  const skillCount = Math.max(skillsList.length, 1)
  const angleStep = (2 * Math.PI) / skillCount

  const skillPoints = useMemo(
    () => buildSkillPoints(skillsList, angleStep),
    [skillsList, angleStep]
  )
  const centerLines = useMemo(
    () =>
      skillPoints.map((point, index) => ({
        x1: CENTER_X,
        y1: CENTER_Y,
        x2: point.x,
        y2: point.y,
        index
      })),
    [skillPoints]
  )
  const skillLabels = useMemo(
    () => buildSkillLabels(skillsList, angleStep),
    [skillsList, angleStep]
  )
  const skillValueLabels = useMemo(
    () => buildSkillValueLabels(skillsList, angleStep),
    [skillsList, angleStep]
  )
  const skillPolygonPoints = useMemo(
    () => skillPoints.map((point) => `${point.x},${point.y}`).join(' '),
    [skillPoints]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setChartLoaded(true), 100)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="page">
      <div className="container">
        <h1 className={styles.pageTitle}>{t('skills.title')}</h1>

        <div className={styles.skillsSection}>
          <h2 className={styles.sectionHeading}>{t('skills.skillset')}</h2>
          <div className={styles.skillsContainer}>
            <div className={styles.radarChartWrapper}>
              <svg
                className={`${styles.radarChart} ${chartLoaded ? styles.chartLoaded : ''}`}
                viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
              >
                <defs>
                  <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe036" stopOpacity="0.38" />
                    <stop offset="50%" stopColor="#ffea78" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#ffe036" stopOpacity="0.38" />
                  </linearGradient>
                  <radialGradient id="pointGradient" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#ffe659" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffe036" stopOpacity="0.82" />
                  </radialGradient>
                  <clipPath id="skillClip">
                    <circle cx={CENTER_X} cy={CENTER_Y} r="0" className={styles.clipCircle}>
                      <animate
                        attributeName="r"
                        from="0"
                        to={RADIUS * 1.8}
                        dur="1.5s"
                        begin="0.3s"
                        fill="freeze"
                      />
                    </circle>
                  </clipPath>
                </defs>

                <g className={styles.gridLines}>
                  {GRID_LEVELS.map((level, index) => (
                    <polygon
                      key={`grid-${level}`}
                      points={getGridPolygonPoints(level, skillCount, angleStep)}
                      className={index === GRID_LEVELS.length - 1 ? styles.gridLevel4 : undefined}
                    />
                  ))}
                </g>

                {centerLines.map((line) => (
                  <line
                    key={`line-${line.index}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    className={`${styles.centerLine} line-${line.index}`}
                  />
                ))}

                <polygon
                  points={skillPolygonPoints}
                  className={styles.skillArea}
                  fill="url(#skillGradient)"
                  clipPath="url(#skillClip)"
                />

                {skillPoints.map((point, index) => (
                  <circle
                    key={`point-${point.x}-${point.y}`}
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    className={`${styles.skillPoint} point-${index}`}
                    fill="url(#pointGradient)"
                  />
                ))}

                {skillLabels.map((label) => (
                  <text
                    key={`label-${label.text}`}
                    x={label.x}
                    y={label.y}
                    className={styles.skillLabel}
                    textAnchor={label.anchor}
                    dominantBaseline={label.baseline}
                  >
                    {label.text}
                  </text>
                ))}

                {skillValueLabels.map((value) => (
                  <text
                    key={`value-${value.text}-${value.x}`}
                    x={value.x}
                    y={value.y}
                    className={styles.skillValue}
                    textAnchor={value.anchor}
                    dominantBaseline={value.baseline}
                  >
                    {value.text}%
                  </text>
                ))}
              </svg>
            </div>

            <div className={styles.skillsListPanel}>
              {sortedSkills.map((skill) => (
                <div key={skill.name} className={styles.skillRow}>
                  <div className={styles.skillRowHead}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillLevel}>{skill.level}%</span>
                  </div>
                  <div className={styles.skillBar}>
                    <div className={styles.skillFill} style={{ width: `${skill.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
