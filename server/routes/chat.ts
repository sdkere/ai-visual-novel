import { Router } from 'express'
import { generateStoryResponse, type StoryContext } from '../services/story-engine.js'

export const chatRouter = Router()

// In-memory session store
const sessions = new Map<string, StoryContext>()

chatRouter.post('/', async (req, res) => {
  try {
    const { storyId, npcId, message, playerAttributes, history, phase } = req.body

    if (!storyId) {
      return res.status(400).json({ error: 'Missing storyId' })
    }

    // Get or create session
    const sessionId = req.body.sessionId || `session_${Date.now()}`
    let context = sessions.get(sessionId)
    if (!context) {
      context = createNewSession(storyId, playerAttributes)
      sessions.set(sessionId, context)
    }

    // Update context
    if (playerAttributes) {
      context.playerState.attributes = playerAttributes
    }
    if (phase) {
      context.sceneId = phase
    }

    // Add player message to history
    context.history.push({
      speaker: 'player',
      content: message || '开始探索',
      timestamp: Date.now(),
      npcId: npcId,
    })

    // Generate AI response
    const response = await generateStoryResponse(context, message || '开始探索', npcId || '_narrator')

    // Add AI response to history
    context.history.push({
      speaker: npcId === '_narrator' ? 'narrator' : 'npc',
      content: response.content,
      timestamp: Date.now(),
      npcId: npcId,
    })

    res.json({
      reply: response.content,
      mood: response.emotion,
      sceneUpdate: '',
      hint: '',
      choices: response.choices || [],
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Legacy endpoint
chatRouter.post('/message', async (req, res) => {
  try {
    const { sessionId, worldId, message, playerName } = req.body
    if (!sessionId || !worldId) {
      return res.status(400).json({ error: 'Missing sessionId or worldId' })
    }

    let context = sessions.get(sessionId)
    if (!context) {
      context = createNewSession(worldId, { name: playerName || '旅行者' })
      sessions.set(sessionId, context)
    }

    context.history.push({
      speaker: 'player',
      content: message || '开始探索',
      timestamp: Date.now(),
    })

    const response = await generateStoryResponse(context, message || '开始探索', '_narrator')

    context.history.push({
      speaker: 'narrator',
      content: response.content,
      timestamp: Date.now(),
    })

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
  if (!context) return res.status(404).json({ error: 'Session not found' })
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

function createNewSession(worldId: string, playerAttrs?: any): StoryContext {
  return {
    worldId,
    sceneId: 'phase_1',
    characters: [],
    playerState: {
      name: playerAttrs?.name || '新来的教师',
      attributes: playerAttrs || {},
      inventory: [],
      relationships: {},
    },
    history: [],
  }
}
