<template>
  <div class="contact page">
    <div class="container">
      <h1 class="page-title">{{ t('contact.title') }}</h1>

      <div class="card">
        <div class="grid">
          <div class="info">
            <h2>{{ t('contact.contactInfo') }}</h2>
            <ul class="list">
              <li>
                <span class="label">{{ t('contact.email') }}</span>
                <a class="value" href="mailto:Tyler.zhang.cn@hotmail.com">Tyler.zhang.cn@hotmail.com</a>
              </li>
              <li>
                <span class="label">{{ t('contact.github') }}</span>
                <a class="value" href="https://github.com/Tylerzhangyi" target="_blank" rel="noopener">github.com/Tylerzhangyi</a>
              </li>
              <li>
                <span class="label">{{ t('contact.gameAccount') }}</span>
                <span class="value">2894936641</span>
              </li>
              <li>
                <span class="label">{{ t('contact.location') }}</span>
                <span class="value">Hangzhou · CN</span>
              </li>
              
            </ul>
            <div class="cta">
              <a class="btn btn-primary" href="mailto:Tyler.zhang.cn@hotmail.com">{{ t('contact.sendMail') }}</a>
              <button class="btn btn-secondary" type="button" @click="goProjectsSection">{{ t('contact.viewProjects') }}</button>
            </div>
          </div>
          <div class="note">
            <h3>{{ t('contact.cooperation') }}</h3>
            <p>{{ t('contact.cooperationText') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>

<script>
import { i18n, t as $t } from '../utils/i18n'

export default {
  name: 'Contact',
  computed: {
    currentLang() {
      return i18n.lang
    }
  },
  methods: {
    t(key) {
      return $t(key)
    },
    goProjectsSection() {
      const doScroll = () => {
        const el = document.getElementById('section-projects')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (this.$route?.path !== '/') {
        this.$router.push('/').then(() => window.setTimeout(doScroll, 60))
        return
      }
      doScroll()
    }
  }
}
</script>

<style scoped>
.page-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--brand);
  text-align: center;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  padding: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
}

.info h2 {
  color: var(--brand);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: grid;
  gap: 0.8rem;
}

.label {
  display: inline-block;
  min-width: 80px;
  color: var(--color-muted);
}

.value {
  color: var(--color-text);
  font-weight: 600;
}

.cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* 只改联系页这两颗 CTA：去掉渐变 */
.cta :deep(.btn.btn-primary) {
  background: rgba(255,224,54,0.94);
  color: rgba(0,0,0,0.82);
  border: 1px solid rgba(255,224,54,0.55);
  box-shadow: 0 14px 46px rgba(0,0,0,0.18);
}
.cta :deep(.btn.btn-primary:hover) {
  background: rgba(255,224,54,0.98);
}
.cta :deep(.btn.btn-secondary) {
  background: rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.10);
  color: rgba(0,0,0,0.78);
}
.cta :deep(.btn.btn-secondary:hover) {
  background: rgba(0,0,0,0.07);
}

.note {
  background: rgba(38,58,82,0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem;
}

.note h3 {
  color: var(--brand);
  margin-bottom: 0.6rem;
}

.note p {
  color: var(--color-muted);
  line-height: 1.8;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>


