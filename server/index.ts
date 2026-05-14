import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'
import { storyRouter } from './routes/story.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/story', storyRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.listen(PORT, () => {
  console.log(`🎮 AI Visual Novel server running on http://localhost:${PORT}`)
})
