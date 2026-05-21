import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { chatRouter } from './routes/chat.js'
import { storyRouter } from './routes/story.js'
import { authRouter } from './routes/auth.js'
import { saveRouter } from './routes/save.js'
import { visitRouter } from './routes/visit.js'
import fs from 'fs'

const app = express()
const PORT: number = parseInt(process.env.PORT || '3001', 10)

app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Public routes
app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/story', storyRouter)

// Protected routes
app.use('/api/saves', saveRouter)

// Visit tracking (public)
app.use('/api/visit', visitRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// Stats dashboard (standalone page)
app.get('/stats', (req, res) => {
  const statsPath = path.join(process.cwd(), 'public', 'stats.html')
  const altPath = path.join(process.cwd(), 'dist', 'stats.html')
  const filePath = fs.existsSync(statsPath) ? statsPath : altPath
  res.sendFile(filePath)
})

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 AI Visual Novel server running on http://0.0.0.0:${PORT}`)
})

// Port 5173 is used by Vite dev server; Express only runs on 3001
