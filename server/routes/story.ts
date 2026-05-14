import { Router } from 'express'

export const storyRouter = Router()

// Available worlds
const WORLDS = [
  {
    id: 'enchanted-forest',
    title: '幻境·迷雾森林',
    description: '在一片被永恒迷雾笼罩的古老森林中，隐藏着一个鲜为人知的精灵王国。千年来，森林的守护结界保护着这里的和平。但最近，结界开始出现裂痕...',
    cover: '/worlds/enchanted-forest.jpg',
    characters: ['艾拉', '凯尔', '露娜'],
    tags: ['奇幻', '冒险', '悬疑'],
    estimatedPlayTime: '2-3小时',
  },
  // More worlds can be added here
]

storyRouter.get('/worlds', (req, res) => {
  res.json(WORLDS)
})

storyRouter.get('/worlds/:worldId', (req, res) => {
  const world = WORLDS.find((w) => w.id === req.params.worldId)
  if (!world) {
    return res.status(404).json({ error: 'World not found' })
  }
  res.json(world)
})
