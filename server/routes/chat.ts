import { Router } from 'express'
import { generateStoryResponse, type StoryContext } from '../services/story-engine.js'

export const chatRouter = Router()

// In-memory session store (replace with Redis in production)
const sessions = new Map<string, StoryContext>()

chatRouter.post('/message', async (req, res) => {
  try {
    const { sessionId, worldId, message, playerName } = req.body

    if (!sessionId || !worldId) {
      return res.status(400).json({ error: 'Missing sessionId or worldId' })
    }

    // Get or create session
    let context = sessions.get(sessionId)
    if (!context) {
      context = createNewSession(worldId, playerName || '旅行者')
      sessions.set(sessionId, context)
    }

    // Add player message to history
    context.history.push({
      speaker: 'player',
      content: message || '开始探索',
      timestamp: Date.now(),
    })

    // Generate AI response
    const response = await generateStoryResponse(context, message || '开始探索')

    // Add AI response to history
    context.history.push({
      speaker: 'narrator',
      content: response.content,
      timestamp: Date.now(),
    })

    // Update scene based on response (simplified)
    context.sceneId = `${context.sceneId}_next`

    res.json({
      content: response.content,
      emotion: response.emotion,
      choices: response.choices,
      sceneId: context.sceneId,
      historyLength: context.history.length,
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

chatRouter.get('/session/:sessionId', (req, res) => {
  const context = sessions.get(req.params.sessionId)
  if (!context) {
    return res.status(404).json({ error: 'Session not found' })
  }
  res.json({
    worldId: context.worldId,
    sceneId: context.sceneId,
    playerState: context.playerState,
    historyLength: context.history.length,
  })
})

chatRouter.delete('/session/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId)
  res.json({ success: true })
})

function createNewSession(worldId: string, playerName: string): StoryContext {
  return {
    worldId,
    sceneId: 'start',
    characters: [
      {
        id: 'aira',
        name: '艾拉',
        personality: '温柔坚强的森林守护者',
        avatar: '/characters/aira.png',
        emotion: 'curious',
      },
      {
        id: 'kael',
        name: '凯尔',
        personality: '沉默寡言的暗影猎人',
        avatar: '/characters/kael.png',
        emotion: 'guarded',
      },
      {
        id: 'luna',
        name: '露娜',
        personality: '神秘的占星师',
        avatar: '/characters/luna.png',
        emotion: 'mysterious',
      },
    ],
    playerState: {
      name: playerName,
      attributes: { courage: 5, wisdom: 5, charisma: 5 },
      inventory: ['古老的指南针'],
      relationships: { aira: 0, kael: 0, luna: 0 },
    },
    history: [],
  }
}
