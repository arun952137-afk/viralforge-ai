import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const PLAN_PRICES = {
  pro:    { monthly: 2399, yearly: 1679 },
  studio: { monthly: 5999, yearly: 4199 },
} as const

export const GENERATION_TYPES = [
  { id: 'script',    label: 'Script',      icon: '📝', credits: 2 },
  { id: 'caption',   label: 'Caption',     icon: '💬', credits: 1 },
  { id: 'thumbnail', label: 'Thumbnail',   icon: '🖼️', credits: 3 },
  { id: 'hook',      label: 'Hook',        icon: '🪝', credits: 1 },
  { id: 'hashtag',   label: 'Hashtags',    icon: '🔍', credits: 1 },
  { id: 'reel_idea', label: 'Reel Idea',   icon: '🎬', credits: 2 },
  { id: 'seo',       label: 'SEO Package', icon: '📈', credits: 2 },
] as const
