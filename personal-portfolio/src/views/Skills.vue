<template>
  <div class="skills page" :class="{ embedded }">
    <div class="container">
      <h1 class="page-title">{{ t('skills.title') }}</h1>
      
      <div class="skills-section">
        <h2>{{ t('skills.skillset') }}</h2>
        <div class="skills-container">
          <div class="radar-chart-wrapper">
            <svg class="radar-chart" :class="{ 'chart-loaded': chartLoaded }" :viewBox="`0 0 ${chartSize} ${chartSize}`">
              <defs>
                <!-- 渐变定义 -->
                <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" :style="{ stopColor: '#ffe036', stopOpacity: 0.38 }" />
                  <stop offset="50%" :style="{ stopColor: '#ffea78', stopOpacity: 0.30 }" />
                  <stop offset="100%" :style="{ stopColor: '#ffe036', stopOpacity: 0.38 }" />
                </linearGradient>
                <radialGradient id="pointGradient" cx="50%" cy="50%">
                  <stop offset="0%" :style="{ stopColor: '#ffe659', stopOpacity: 1 }" />
                  <stop offset="100%" :style="{ stopColor: '#ffe036', stopOpacity: 0.82 }" />
                </radialGradient>
                <!-- 从中心展开的clipPath - 使用径向渐变 -->
                <clipPath id="skillClip">
                  <circle :cx="centerX" :cy="centerY" r="0" class="clip-circle">
                    <animate attributeName="r" from="0" :to="radius * 1.8" dur="1.5s" begin="0.3s" fill="freeze" />
                  </circle>
                </clipPath>
              </defs>
              
              <!-- 背景网格 -->
              <g class="grid-lines">
                <polygon
                  v-for="(level, index) in gridLevels"
                  :key="'grid-' + index"
                  :points="getGridPolygonPoints(level)"
                  :class="'grid-level-' + index"
                />
              </g>
              
              <!-- 从中心到顶点的连接线 -->
              <line
                v-for="(line, index) in centerLines"
                :key="'line-' + index"
                :x1="line.x1"
                :y1="line.y1"
                :x2="line.x2"
                :y2="line.y2"
                class="center-line"
                :class="'line-' + index"
              />
              
              <!-- 技能区域 -->
              <polygon
                :points="getSkillPolygonPoints()"
                class="skill-area"
                fill="url(#skillGradient)"
                clip-path="url(#skillClip)"
              />
              
              <!-- 技能点 -->
              <circle
                v-for="(point, index) in skillPoints"
                :key="'point-' + index"
                :cx="point.x"
                :cy="point.y"
                r="5"
                class="skill-point"
                :class="'point-' + index"
                fill="url(#pointGradient)"
              />
              
              <!-- 技能标签 -->
              <text
                v-for="(label, index) in skillLabels"
                :key="'label-' + index"
                :x="label.x"
                :y="label.y"
                class="skill-label"
                :text-anchor="label.anchor"
                :dominant-baseline="label.baseline"
              >
                {{ label.text }}
              </text>
              
              <!-- 技能值标签 -->
              <text
                v-for="(value, index) in skillValueLabels"
                :key="'value-' + index"
                :x="value.x"
                :y="value.y"
                class="skill-value"
                :text-anchor="value.anchor"
                :dominant-baseline="value.baseline"
              >
                {{ value.text }}%
              </text>
            </svg>
          </div>
          <div class="skills-list-panel">
            <div v-for="skill in sortedSkills" :key="skill.name" class="skill-row">
              <div class="skill-row-head">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-level">{{ skill.level }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: `${skill.level}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n, t as $t, getDict } from '../utils/i18n'

export default {
  name: 'Skills',
  props: {
    embedded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartSize: 500,
      centerX: 250,
      centerY: 250,
      radius: 138,
      gridLevels: [0.2, 0.4, 0.6, 0.8, 1.0],
      skillAreaColor: 'rgba(255, 45, 117, 0.25)',
      labelOffset: 44,
      chartLoaded: false
    }
  },
  computed: {
    currentLang() {
      return i18n.lang
    },
    skillsList() {
      return getDict('skills.skillsList') || []
    },
    sortedSkills() {
      return [...this.skillsList].sort((a, b) => b.level - a.level)
    },
    skillCount() {
      return Math.max(this.skillsList.length, 1)
    },
    angleStep() {
      return (2 * Math.PI) / this.skillCount
    },
    skillPoints() {
      return this.skillsList.map((skill, index) => {
        const angle = (index * this.angleStep) - (Math.PI / 2)
        const level = skill.level / 100
        const r = this.radius * level
        return {
          x: this.centerX + r * Math.cos(angle),
          y: this.centerY + r * Math.sin(angle),
          angle
        }
      })
    },
    centerLines() {
      return this.skillPoints.map((point, index) => ({
        x1: this.centerX,
        y1: this.centerY,
        x2: point.x,
        y2: point.y,
        index
      }))
    },
    skillLabels() {
      return this.skillsList.map((skill, index) => {
        const angle = (index * this.angleStep) - (Math.PI / 2)
        const labelRadius = this.radius + this.labelOffset
        let x = this.centerX + labelRadius * Math.cos(angle)
        let y = this.centerY + labelRadius * Math.sin(angle)
        
        // 确定文本对齐方式
        let anchor = 'middle'
        let baseline = 'middle'
        
        // 根据角度调整位置，避免被遮挡
        if (Math.abs(Math.cos(angle)) < 0.1) {
          // 垂直方向
          anchor = 'middle'
          if (Math.sin(angle) > 0) {
            baseline = 'hanging'
            y += 5 // 向下偏移一点
          } else {
            baseline = 'auto'
            y -= 5 // 向上偏移一点
          }
        } else if (Math.cos(angle) > 0) {
          // 右侧
          anchor = 'start'
          x += 25 // 向右偏移更多，避免被遮挡（特别是JavaScript）
          baseline = 'middle'
        } else {
          // 左侧
          anchor = 'end'
          x -= 25 // 向左偏移更多
          baseline = 'middle'
        }
        
        return {
          x,
          y,
          text: skill.name,
          anchor,
          baseline
        }
      })
    },
    skillValueLabels() {
      return this.skillsList.map((skill, index) => {
        const angle = (index * this.angleStep) - (Math.PI / 2)
        const level = skill.level / 100
        const r = this.radius * level
        const valueRadius = r - 15
        const x = this.centerX + valueRadius * Math.cos(angle)
        const y = this.centerY + valueRadius * Math.sin(angle)
        
        let anchor = 'middle'
        let baseline = 'middle'
        
        if (Math.abs(Math.cos(angle)) < 0.1) {
          anchor = 'middle'
        } else if (Math.cos(angle) > 0) {
          anchor = 'start'
        } else {
          anchor = 'end'
        }
        
        return {
          x,
          y,
          text: skill.level,
          anchor,
          baseline
        }
      })
    }
  },
  mounted() {
    // 触发加载动画
    this.$nextTick(() => {
      setTimeout(() => {
        this.chartLoaded = true
      }, 100)
    })
  },
  methods: {
    t(key) {
      return $t(key)
    },
    getGridPolygonPoints(level) {
      const points = []
      for (let i = 0; i < this.skillCount; i++) {
        const angle = (i * this.angleStep) - (Math.PI / 2)
        const r = this.radius * level
        const x = this.centerX + r * Math.cos(angle)
        const y = this.centerY + r * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return points.join(' ')
    },
    getSkillPolygonPoints() {
      return this.skillPoints.map(p => `${p.x},${p.y}`).join(' ')
    }
  }
}
</script>

<style scoped>
.skills.embedded {
  min-height: 0;
  height: 100%;
}
.skills.embedded .container {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
}
.skills.embedded .page-title {
  margin-bottom: 1.2rem;
}
.skills.embedded .skills-section {
  margin-bottom: 0;
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
}
.skills.embedded .skills-container {
  min-height: 0;
  align-items: start;
}
.skills.embedded .radar-chart-wrapper {
  padding: 0.25rem 0.5rem 0.5rem;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--brand);
  text-align: center;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.skills-section {
  background: var(--color-surface);
  padding: 1.6rem 1.6rem 1.2rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

h2 {
  color: var(--brand);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.skills-container {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(280px, 340px);
  gap: 12px;
  align-items: start;
}

.radar-chart-wrapper {
  width: 100%;
  max-width: 620px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0.4rem 0.8rem 0.4rem;
}
.skills-list-panel {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.86);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 14px 34px rgba(0,0,0,0.10);
}
.skill-row {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.skill-row:last-child {
  border-bottom: 0;
}
.skill-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.skill-name {
  color: rgba(0,0,0,0.84);
  font-weight: 800;
  letter-spacing: 0.01em;
}
.skill-level {
  color: rgba(0,0,0,0.62);
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}
.skill-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(0,0,0,0.08);
  overflow: hidden;
}
.skill-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255,224,54,0.96), rgba(255,224,54,0.72));
}

.radar-chart {
  width: 100%;
  max-width: 500px;
  height: auto;
}

.grid-lines polygon {
  fill: none;
  stroke: rgba(0, 0, 0, 0.34);
  stroke-width: 1.5;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.radar-chart.chart-loaded .grid-lines polygon {
  opacity: 1;
}

.grid-lines polygon.grid-level-4 {
  stroke-width: 2;
  stroke: rgba(0, 0, 0, 0.52);
}

.center-line {
  stroke: rgba(0, 0, 0, 0.24);
  stroke-width: 1;
  opacity: 0;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  transition: opacity 0.6s ease, stroke-dashoffset 0.8s ease;
}

.radar-chart.chart-loaded .center-line {
  opacity: 1;
  stroke-dashoffset: 0;
}

.radar-chart.chart-loaded .center-line.line-0 { transition-delay: 0.2s; }
.radar-chart.chart-loaded .center-line.line-1 { transition-delay: 0.3s; }
.radar-chart.chart-loaded .center-line.line-2 { transition-delay: 0.4s; }
.radar-chart.chart-loaded .center-line.line-3 { transition-delay: 0.5s; }
.radar-chart.chart-loaded .center-line.line-4 { transition-delay: 0.6s; }

.clip-circle {
  fill: white;
}

.skill-area {
  stroke: rgba(255, 224, 54, 0.95);
  stroke-width: 2.5;
  opacity: 0;
  transition: opacity 1s ease 0.4s;
}

.radar-chart.chart-loaded .skill-area {
  opacity: 0.9;
}

.skill-point {
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.radar-chart.chart-loaded .skill-point {
  opacity: 1;
  transform: scale(1);
}

.radar-chart.chart-loaded .skill-point.point-0 { transition-delay: 0.5s; }
.radar-chart.chart-loaded .skill-point.point-1 { transition-delay: 0.6s; }
.radar-chart.chart-loaded .skill-point.point-2 { transition-delay: 0.7s; }
.radar-chart.chart-loaded .skill-point.point-3 { transition-delay: 0.8s; }
.radar-chart.chart-loaded .skill-point.point-4 { transition-delay: 0.9s; }

.skill-label {
  font-size: 13px;
  font-weight: 600;
  fill: var(--color-text);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  transition-delay: 0.8s;
}

.radar-chart.chart-loaded .skill-label {
  opacity: 1;
}

.skill-value {
  font-size: 11px;
  font-weight: 700;
  fill: rgba(138, 111, 0, 0.95);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  transition-delay: 1s;
}

.radar-chart.chart-loaded .skill-value {
  opacity: 1;
}



.timeline {
  position: relative;
}

.timeline-item {
  padding-left: 2rem;
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: -2rem;
  width: 2px;
  background: var(--accent);
  opacity: 0.3;
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--color-surface);
  box-shadow: 0 0 0 2px var(--accent);
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-content h3 {
  color: var(--brand);
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1.2rem;
}

.institution {
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.3rem;
  font-size: 1rem;
}

.period {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--color-muted);
  line-height: 1.7;
  font-size: 0.95rem;
}

.description a {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}

.description a:hover {
  text-decoration: underline;
}

.courses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.course-tag {
  background: var(--color-surface);
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.course-tag:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.awards-list {
  list-style: none;
  padding: 0;
}

.awards-list li {
  padding: 1.2rem 1.5rem;
  margin-bottom: 0.75rem;
  background: var(--color-surface);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.awards-list li:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}

.award-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--accent);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .skills-section {
    padding: 1.5rem;
  }

  .skills-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .radar-chart-wrapper {
    padding: 1rem;
  }

  .timeline-item {
    padding-left: 1.5rem;
  }
}
</style>

