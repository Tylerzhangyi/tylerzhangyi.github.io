<template>
  <div class="edu">
    <div class="container">
      <div class="head">
        <div class="kicker">{{ t('nav.education') }}</div>
        <h2 class="title">{{ t('about.education') }}</h2>
      </div>

      <div class="timeline">
        <div v-for="(edu, index) in educationList" :key="index" class="item">
          <div class="dot" aria-hidden="true"></div>
          <div class="content">
            <div class="row">
              <div class="degree">{{ edu.degree }}</div>
              <div class="period">{{ edu.period }}</div>
            </div>
            <div class="institution">{{ edu.institution }}</div>
            <div class="desc">
              <template v-if="edu.link">
                <a :href="edu.link" target="_blank" rel="noopener noreferrer">{{ edu.description }}</a>
              </template>
              <template v-else>
                {{ edu.description }}
              </template>
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
  name: 'EducationSection',
  computed: {
    __lang() {
      return i18n.lang
    },
    educationList() {
      return getDict('skills.educationList') || []
    }
  },
  methods: {
    t(key) {
      return $t(key)
    }
  }
}
</script>

<style scoped>
.edu {
  padding: 76px 0 70px;
  background: #fff;
}
.head {
  margin-bottom: 26px;
  display: grid;
  gap: 8px;
}
.kicker {
  font-weight: 900;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  color: rgba(0, 0, 0, 0.55);
}
.title {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  letter-spacing: -0.02em;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.88);
}
.timeline {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.06);
}
.item {
  position: relative;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 14px;
  padding: 18px 18px;
  box-shadow: inset 0 -1px rgba(0, 0, 0, 0.06);
}
.item:last-child {
  box-shadow: none;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  background: rgba(0, 0, 0, 0.78);
  box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.06);
}
.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.degree {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.86);
}
.period {
  font-weight: 800;
  letter-spacing: 0.06em;
  font-size: 0.78rem;
  color: rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}
.institution {
  margin-top: 4px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.72);
}
.desc {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.62);
  line-height: 1.75;
}
.desc a {
  color: rgba(0, 0, 0, 0.82);
  font-weight: 800;
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
}
.desc a:hover {
  border-bottom-color: rgba(0, 0, 0, 0.55);
}
</style>

