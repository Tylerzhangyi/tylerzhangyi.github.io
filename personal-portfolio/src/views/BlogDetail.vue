<template>
  <div class="blog-detail page">
    <div class="container">
      <div v-if="loading" class="loading loading-shell">
        <div class="blog-detail-content">
          <div class="skeleton-line w-sm"></div>
          <article class="blog-article">
            <div class="skeleton-line w-lg"></div>
            <div class="skeleton-line w-md"></div>
            <div class="skeleton-block"></div>
          </article>
        </div>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <router-link to="/blog" class="btn btn-primary">{{ t('blogDetail.back') }}</router-link>
      </div>

      <div v-else-if="post" class="blog-detail-content detail-enter">
        <button type="button" class="close-fab" @click="goBackToBlogList($event)" aria-label="关闭详情">
          CLOSE
        </button>
        <button type="button" class="back-link" @click="goBackToBlogList($event)">← {{ t('blogDetail.back') }}</button>
        
        <article class="blog-article">
          <header class="article-header">
            <h1 class="article-title">{{ post.title }}</h1>
            <div class="article-meta">
              <span class="article-date">
                <CalendarIcon class="article-date-icon" />
                {{ formatDate(post.date) }}
              </span>
              <span class="article-category">{{ post.category }}</span>
            </div>
          </header>

          <div class="article-content">
            <div v-html="formattedContent"></div>
          </div>

          <footer class="article-footer">
            <div class="article-tags" v-if="post.tags && post.tags.length > 0">
              <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import { CalendarIcon } from '@heroicons/vue/24/outline'
import { marked } from 'marked'
import { i18n, t as $t } from '../utils/i18n'
import { setTransitionOrigin, setTransitionOriginFromElement, scrollDetailToTop } from '../utils/pageTransition'

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
})

export default {
  name: 'BlogDetail',
  components: {
    CalendarIcon
  },
  data() {
    return {
      post: null,
      loading: true,
      error: null
    }
  },
  computed: {
    __lang() { return i18n.lang },
    formattedContent() {
      if (!this.post || !this.post.content) return ''
      try {
        // 将 JSON 中的 \n 字符串转换为真正的换行符
        // JSON 解析后，\\n 会变成字符串 \n（两个字符），需要转换为真正的换行符
        let content = this.post.content.replace(/\\n/g, '\n')
        // marked v4+ 使用同步 parse 方法
        let html = marked.parse(content)
        // 处理图片路径，添加 BASE_URL
        const baseUrl = import.meta.env.BASE_URL
        html = html.replace(/<img([^>]*?)src="(\/[^"]+)"([^>]*?)>/g, (match, before, src, after) => {
          // 如果路径以 / 开头且不是外部链接，添加 BASE_URL
          if (src.startsWith('/') && !src.startsWith('//')) {
            const cleanSrc = src.replace(/^\//, '')
            return `<img${before}src="${baseUrl}${cleanSrc}"${after}>`
          }
          return match
        })
        return html
      } catch (error) {
        console.error('Markdown parsing error:', error)
        return this.post.content.replace(/\\n/g, '\n')
      }
    }
  },
  async mounted() {
    scrollDetailToTop()
    await this.fetchPost()
  },
  watch: {
    '$route'() {
      scrollDetailToTop()
      this.fetchPost()
    },
    async __lang() {
      this.loading = true
      await this.fetchPost()
    }
  },
  methods: {
    t(key) {
      return $t(key)
    },
    async fetchPost() {
      const postId = this.$route.params.id
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/blog.${i18n.lang}.json`)
        if (!response.ok) {
          throw new Error($t('blogDetail.loadError') || '无法加载博客数据')
        }
        const data = await response.json()
        const post = data.posts.find(p => p.id === parseInt(postId))
        if (!post) {
          throw new Error($t('blogDetail.notFound') || '文章不存在')
        }
        this.post = post
        this.loading = false
      } catch (error) {
        this.error = error.message
        this.loading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const locale = i18n.lang === 'zh' ? 'zh-CN' : 'en-US'
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    goBackToBlogList(event) {
      if (event?.clientX != null) {
        setTransitionOrigin(event.clientX, event.clientY)
      } else {
        setTransitionOriginFromElement(document.querySelector('.close-fab'))
      }
      const doScroll = () => {
        const el = document.getElementById('section-blog')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      this.$router.push('/').then(() => window.setTimeout(doScroll, 120))
    }
  }
}
</script>

<style scoped>
.blog-detail {
  background-image: var(--contour-light-bg);
  background-size: 56px 56px, 56px 56px, 100% 100%;
  color: #1f2530;
  --brand: #0f141c;
  --color-text: #252c37;
  --color-muted: #5e6776;
  --color-surface: rgba(255,255,255,0.88);
  --border: rgba(0,0,0,0.12);
  --accent: rgba(255,224,54,0.96);
  --accent-600: rgba(255,224,54,1);
}

.blog-detail-content {
  max-width: 800px;
  margin: 0 auto;
}

.close-fab {
  position: fixed;
  top: 18px;
  right: 24px;
  z-index: 2200;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.14);
  background: rgba(255,255,255,0.88);
  color: rgba(0,0,0,0.78);
  font-weight: 900;
  letter-spacing: 0.1em;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0,0,0,0.16);
  backdrop-filter: blur(6px);
  transition:
    transform var(--dur-fast) var(--ease-spring),
    box-shadow var(--dur-mid) var(--ease-out),
    background var(--dur-fast) var(--ease-io);
}
.close-fab:hover {
  background: rgba(255,255,255,0.98);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 16px 38px rgba(0,0,0,0.22);
}
.close-fab:active {
  transform: scale(0.97);
}

.back-link {
  display: inline-block;
  color: rgba(0,0,0,0.72);
  margin-bottom: 2rem;
  font-weight: 700;
  transition: color 0.3s, transform 0.28s var(--ease-spring);
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.back-link:hover {
  color: rgba(0,0,0,0.92);
  transform: translateX(-5px);
}

@media (prefers-reduced-motion: no-preference) {
  .detail-enter {
    animation: detail-in 780ms cubic-bezier(.22,1,.36,1) both;
  }
  .detail-enter .blog-article {
    animation: article-in 920ms cubic-bezier(.22,1,.36,1) 120ms both;
  }
  .detail-enter .close-fab {
    animation: fab-in 640ms cubic-bezier(.34,1.28,.64,1) 200ms both;
  }
}
@keyframes detail-in {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}
@keyframes article-in {
  from { opacity: 0; transform: translateY(24px) scale(0.992); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes fab-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.92); }
  to { opacity: 1; transform: none; }
}

.blog-article {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
  border: 1px solid rgba(0,0,0,0.12);
  backdrop-filter: blur(6px);
}

.article-header {
  border-bottom: 2px solid var(--border);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2.5rem;
  color: var(--brand);
  margin-bottom: 1rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--color-muted);
  align-items: center;
}

.article-date {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.article-date-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-muted);
  flex-shrink: 0;
}

.article-category {
  background: rgba(255,224,54,0.96);
  color: rgba(0,0,0,0.78);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid rgba(0,0,0,0.14);
  font-weight: 700;
}

.article-content {
  color: var(--color-text);
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 2rem;
}

.article-content :deep(p) {
  margin-bottom: 1.5rem;
}

.article-content :deep(h1) {
  color: var(--brand);
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.3;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
}

.article-content :deep(h2) {
  color: var(--brand);
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.4;
}

.article-content :deep(h3) {
  color: rgba(0,0,0,0.86);
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
}

.article-content :deep(h4) {
  color: rgba(0,0,0,0.82);
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.article-content :deep(strong) {
  font-weight: 600;
  color: var(--color-text);
}

.article-content :deep(em) {
  font-style: italic;
}

.article-content :deep(a) {
  color: rgba(0,0,0,0.82);
  text-decoration: none;
  border-bottom: 1px solid rgba(255,224,54,0.7);
  transition: border-color 0.3s;
}

.article-content :deep(a:hover) {
  border-bottom-color: rgba(0,0,0,0.5);
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-left: 2rem;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
}

.article-content :deep(li) {
  margin-bottom: 0.8rem;
  line-height: 1.7;
}

.article-content :deep(ul li) {
  list-style-type: disc;
}

.article-content :deep(ol li) {
  list-style-type: decimal;
}

.article-content :deep(blockquote) {
  border-left: 4px solid rgba(255,224,54,0.95);
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: var(--color-muted);
  font-style: italic;
  background: rgba(0,0,0,0.02);
  padding: 1rem 1.5rem;
  border-radius: 4px;
}

.article-content :deep(code) {
  background: rgba(255,224,54,0.14);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  border: 1px solid var(--border);
  color: var(--color-text);
}

.article-content :deep(pre) {
  background: rgba(255,255,255,0.75);
  padding: 1.2rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--border);
}

.article-content :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
  font-size: 0.9em;
  line-height: 1.6;
}

.article-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--border);
  margin: 2rem 0;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}

.article-content :deep(th) {
  background: rgba(0,0,0,0.04);
  font-weight: 600;
  color: var(--brand);
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 2rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
}

.article-footer {
  border-top: 2px solid var(--border);
  padding-top: 1.5rem;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: rgba(255,224,54,0.14);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text);
  border: 1px solid var(--border);
  transition:
    transform var(--dur-fast) var(--ease-spring),
    background var(--dur-fast) var(--ease-io),
    box-shadow var(--dur-mid) var(--ease-out);
}
.tag:hover {
  transform: translateY(-2px);
  background: rgba(255,224,54,0.28);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #666;
}
.loading-shell {
  text-align: left;
}
.skeleton-line {
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(0,0,0,0.08), rgba(0,0,0,0.04), rgba(0,0,0,0.08));
  background-size: 220% 100%;
  animation: sk 1.2s linear infinite;
  margin-bottom: 12px;
}
.skeleton-line.w-sm { width: 180px; margin-bottom: 20px; }
.skeleton-line.w-md { width: 58%; }
.skeleton-line.w-lg { width: 72%; height: 20px; margin-bottom: 18px; }
.skeleton-block {
  height: 280px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.03), rgba(0,0,0,0.06));
  background-size: 220% 100%;
  animation: sk 1.2s linear infinite;
}
@keyframes sk {
  from { background-position: 0% 0; }
  to { background-position: 220% 0; }
}

.error {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }

  .blog-article {
    padding: 1.5rem;
  }

  .article-content {
    font-size: 1rem;
  }
}
</style>

