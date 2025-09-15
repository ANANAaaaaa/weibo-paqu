export interface HotItem {
  id: string
  title: string
  summary?: string
  link?: string
  pubDate: string
  platform: string
  sourceName: string
  score?: number
  category?: string
}

export interface RSSItem extends HotItem {
  description?: string
}

export interface Topic {
  title: string
  angle: string
  refs: string[]
}

export interface Draft {
  id: string
  topicId: string
  content: string
  style: string
  createdAt: string
  finalized: boolean
  versions: {
    items: Array<{
      content: string
      createdAt: string
    }>
  }
}

export interface FilterOptions {
  source: string
  search: string
  sortBy: string
}

export interface AIFilterResult {
  filteredIds: string[]
  reasonById: Record<string, string>
}

export interface ViolationCheck {
  highlights: Array<{
    text: string
    start: number
    end: number
    risk: string
  }>
  suggestions: Array<{
    target: string
    candidates: string[]
    note: string
  }>
}