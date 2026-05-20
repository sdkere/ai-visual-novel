import { Router } from 'express'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import {
  createSave, updateSave, getSavesByUser, getSavesByUserAndStory,
  getSaveById, deleteSave,
} from '../db/database.js'

export const saveRouter = Router()

// All save routes require authentication
saveRouter.use(authMiddleware)

// GET /api/saves - List all saves for current user
saveRouter.get('/', (req: AuthRequest, res) => {
  try {
    const saves = getSavesByUser(req.userId!)
    res.json(saves)
  } catch (error) {
    console.error('Get saves error:', error)
    res.status(500).json({ error: '获取存档列表失败' })
  }
})

// GET /api/saves/story/:storyId - List saves for a specific story
saveRouter.get('/story/:storyId', (req: AuthRequest, res) => {
  try {
    const saves = getSavesByUserAndStory(req.userId!, req.params.storyId as string)
    res.json(saves)
  } catch (error) {
    console.error('Get story saves error:', error)
    res.status(500).json({ error: '获取存档列表失败' })
  }
})

// GET /api/saves/:id - Get a specific save (full data)
saveRouter.get('/:id', (req: AuthRequest, res) => {
  try {
    const save = getSaveById(parseInt(req.params.id as string), req.userId!)
    if (!save) {
      return res.status(404).json({ error: '存档不存在' })
    }
    // Parse JSON fields
    res.json({
      ...save,
      player_attributes: JSON.parse(save.player_attributes),
      messages: JSON.parse(save.messages),
      choices: JSON.parse(save.choices || '[]'),
    })
  } catch (error) {
    console.error('Get save error:', error)
    res.status(500).json({ error: '读取存档失败' })
  }
})

// POST /api/saves - Create a new save
saveRouter.post('/', (req: AuthRequest, res) => {
  try {
    const {
      saveName, storyId, storyTitle,
      playerAttributes, messages, currentNPC,
      phase, emotion, choices, messageCount,
    } = req.body

    if (!storyId || !messages) {
      return res.status(400).json({ error: '缺少必要数据' })
    }

    const result = createSave(req.userId!, {
      saveName: saveName || `存档 ${new Date().toLocaleString('zh-CN')}`,
      storyId,
      storyTitle: storyTitle || '',
      playerAttributes: JSON.stringify(playerAttributes),
      messages: JSON.stringify(messages),
      currentNPC: currentNPC || null,
      phase: phase || 'phase_1',
      emotion: emotion || 'neutral',
      choices: JSON.stringify(choices || []),
      messageCount: messageCount || messages.length,
    })

    res.json({
      success: true,
      saveId: Number(result.lastInsertRowid),
    })
  } catch (error) {
    console.error('Create save error:', error)
    res.status(500).json({ error: '创建存档失败' })
  }
})

// PUT /api/saves/:id - Update an existing save
saveRouter.put('/:id', (req: AuthRequest, res) => {
  try {
    const saveId = parseInt(req.params.id as string)
    const existing = getSaveById(saveId, req.userId!)
    if (!existing) {
      return res.status(404).json({ error: '存档不存在' })
    }

    const {
      saveName, playerAttributes, messages, currentNPC,
      phase, emotion, choices, messageCount,
    } = req.body

    updateSave(saveId, req.userId!, {
      saveName,
      playerAttributes: playerAttributes ? JSON.stringify(playerAttributes) : undefined,
      messages: messages ? JSON.stringify(messages) : undefined,
      currentNPC,
      phase,
      emotion,
      choices: choices ? JSON.stringify(choices) : undefined,
      messageCount,
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Update save error:', error)
    res.status(500).json({ error: '更新存档失败' })
  }
})

// DELETE /api/saves/:id - Delete a save
saveRouter.delete('/:id', (req: AuthRequest, res) => {
  try {
    const saveId = parseInt(req.params.id as string)
    const result = deleteSave(saveId, req.userId!)
    if (result.changes === 0) {
      return res.status(404).json({ error: '存档不存在' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Delete save error:', error)
    res.status(500).json({ error: '删除存档失败' })
  }
})
