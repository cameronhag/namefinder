export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')      // spaces to hyphens
    .replace(/-+/g, '-')       // collapse multiple hyphens
}

export function slugToName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) // title case
}
