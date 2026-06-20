import fs from 'fs'
import path from 'path'

import BlogDetailClient from './BlogDetailClient'

function readBlogIds() {
  const ids = new Set()
  const dataDir = path.join(process.cwd(), 'public/data')
  const files = ['blog.json', 'blog.zh.json', 'blog.en.json']

  for (const file of files) {
    const dataPath = path.join(dataDir, file)
    if (!fs.existsSync(dataPath)) continue
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)
    for (const post of data.posts || []) {
      ids.add(String(post.id))
    }
  }

  return Array.from(ids).map((id) => ({ id }))
}

export function generateStaticParams() {
  return readBlogIds()
}

export default function BlogDetailPage() {
  return <BlogDetailClient />
}
