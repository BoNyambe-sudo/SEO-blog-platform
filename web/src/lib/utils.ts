interface TextBlock {
  _type?: string
  style?: string
  children?: { text?: string }[]
}

export interface ContentHeading {
  text: string
  id: string
  level: 2 | 3
}

export function calculateReadTime(content: TextBlock[]): number {
  const text = content
    .map((block) => block.children?.map((child) => child.text || '').join('') || '')
    .join(' ')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getContentHeadings(content: TextBlock[]): ContentHeading[] {
  const usedIds = new Map<string, number>()

  return content.flatMap((block, index) => {
    if (block._type !== 'block' || (block.style !== 'h2' && block.style !== 'h3')) return []

    const text = block.children?.map((child) => child.text || '').join('').trim() || ''
    if (!text) return []

    const baseId = slugify(text) || `section-${index + 1}`
    const occurrence = (usedIds.get(baseId) || 0) + 1
    usedIds.set(baseId, occurrence)

    return [
      {
        text,
        id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
        level: block.style === 'h2' ? 2 : 3,
      },
    ]
  })
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
