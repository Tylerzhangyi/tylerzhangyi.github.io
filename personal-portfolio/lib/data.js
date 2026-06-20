const DATA_BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

function dataUrl(path) {
  return `${DATA_BASE}/${path.replace(/^\//, '')}`
}

async function fetchJsonWithFallback(paths) {
  let lastError = null
  for (const path of paths) {
    try {
      const res = await fetch(dataUrl(path))
      if (res.ok) return res.json()
      lastError = new Error(`Failed to fetch ${path}: ${res.status}`)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Failed to load data')
}

export async function fetchProjects(lang) {
  const data = await fetchJsonWithFallback([
    `data/projects.${lang}.json`,
    'data/projects.json'
  ])
  return data.projects || []
}

export async function fetchProjectById(id, lang) {
  const projects = await fetchProjects(lang)
  const project = projects.find((item) => item.id === parseInt(id, 10))
  if (!project) {
    const error = new Error('not found')
    error.code = 'NOT_FOUND'
    throw error
  }
  return project
}

export async function fetchBlogPosts(lang) {
  const data = await fetchJsonWithFallback([
    `data/blog.${lang}.json`,
    'data/blog.json'
  ])
  return data.posts || []
}

export async function fetchBlogPostById(id, lang) {
  const posts = await fetchBlogPosts(lang)
  const post = posts.find((item) => item.id === parseInt(id, 10))
  if (!post) {
    const error = new Error('not found')
    error.code = 'NOT_FOUND'
    throw error
  }
  return post
}
