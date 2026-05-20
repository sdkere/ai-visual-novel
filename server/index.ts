import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'
import { storyRouter } from './routes/story.js'
import { authRouter } from './routes/auth.js'
import { saveRouter } from './routes/save.js'

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 AI Visual Novel server running on http://0.0.0.0:${PORT}`)
})
