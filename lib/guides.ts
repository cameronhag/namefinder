import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export type GuideFAQ = {
  question: string
  answer: string
}

export type GuideFrontmatter = {
  slug: string
  title: string
  description: string
  lastUpdated: string
  category: string
  faqs?: GuideFAQ[]
}

export type Guide = {
  frontmatter: GuideFrontmatter
  content: string
}

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides')

function readGuideFile(slug: string): Guide | null {
  const filePath = path.join(GUIDES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data as Partial<GuideFrontmatter>

  if (!data.title || !data.description || !data.lastUpdated || !data.category) {
    throw new Error(
      `Guide "${slug}" is missing required frontmatter (title, description, lastUpdated, category).`
    )
  }

  return {
    frontmatter: {
      slug,
      title: data.title,
      description: data.description,
      lastUpdated: data.lastUpdated,
      category: data.category,
      faqs: data.faqs,
    },
    content: parsed.content,
  }
}

export function getAllGuides(): GuideFrontmatter[] {
  if (!fs.existsSync(GUIDES_DIR)) return []
  const entries = fs
    .readdirSync(GUIDES_DIR)
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''))

  const guides: GuideFrontmatter[] = []
  for (const slug of entries) {
    const guide = readGuideFile(slug)
    if (guide) guides.push(guide.frontmatter)
  }

  return guides.sort(
    (a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  )
}

export function getGuideBySlug(slug: string): Guide | null {
  return readGuideFile(slug)
}
