import fs from 'fs'
import path from 'path'

import ProjectDetailClient from './ProjectDetailClient'

function readProjectIds() {
  const dataPath = path.join(process.cwd(), 'public/data/projects.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)
  return (data.projects || []).map((project) => ({ id: String(project.id) }))
}

export function generateStaticParams() {
  return readProjectIds()
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />
}
