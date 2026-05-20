import { Router } from 'express'
import fs from 'fs'
import path from 'path'

export const storyRouter = Router()

const storiesDir = path.join(process.cwd(), 'data', 'stories')

function loadStories() {
  if (!fs.existsSync(storiesDir)) return []
  return fs.readdirSync(storiesDir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(storiesDir, f), 'utf-8')))
}

// GET /api/categories
storyRouter.get('/categories', (req, res) => {
  const stories = loadStories()
  const categoryMap = new Map<string, any>()

  for (const story of stories) {
    const catId = story.category || 'uncategorized'
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id: catId,
        name: getCategoryName(catId),
        icon: story.categoryIcon || '📚',
        description: story.categoryDesc || '',
        storyCount: 0,
        stories: [],
      })
    }
    const cat = categoryMap.get(catId)!
    cat.storyCount++
    cat.stories.push({
      id: story.id,
      title: story.title,
      subtitle: story.subtitle,
      cover: story.cover,
      category: story.category,
      difficulty: story.difficulty,
      tags: story.tags || [],
      npcCount: story.npcs ? story.npcs.length : 0,
    })
  }

  res.json(Array.from(categoryMap.values()))
})

// GET /api/stories/:id
storyRouter.get('/stories/:id', (req, res) => {
  const stories = loadStories()
  const story = stories.find((s) => s.id === req.params.id)
  if (!story) return res.status(404).json({ error: 'Story not found' })
  res.json(story)
})

// Legacy endpoint
storyRouter.get('/worlds', (req, res) => {
  const stories = loadStories()
  res.json(stories.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.background?.substring(0, 200) || '',
    cover: s.cover || '',
    characters: s.npcs?.map((n: any) => n.name) || [],
    tags: s.tags || [],
    estimatedPlayTime: '2-3小时',
  })))
})

function getCategoryName(catId: string): string {
  const names: Record<string, string> = {
    'classic-literature': '🌀 经典重构',
    'mystery': '🔍 烧脑推理',
    'romance': '💕 浪漫邂逅',
    'scifi': '🚀 未来异想',
    'fantasy': '⚔️ 异世冒险',
    'horror': '👻 暗夜惊魂',
  }
  return names[catId] || catId
}
