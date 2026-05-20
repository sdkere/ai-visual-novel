import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { createUser, getUserByUsername, updateLastLogin } from '../db/database.js'
import { generateToken } from '../middleware/auth.js'

export const authRouter = Router()

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }

    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度为2-20个字符' })
    }

    if (password.length < 4) {
      return res.status(400).json({ error: '密码长度至少4个字符' })
    }

    // Check if user exists
    const existing = getUserByUsername(username)
    if (existing) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    // Hash password and create user
    const passwordHash = bcrypt.hashSync(password, 10)
    const result = createUser(username, passwordHash)

    const token = generateToken(Number(result.lastInsertRowid), username)

    res.json({
      success: true,
      token,
      user: { id: Number(result.lastInsertRowid), username },
    })
  } catch (error: any) {
    console.error('Register error:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }

    const user = getUserByUsername(username)
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' })
    }

    const valid = bcrypt.compareSync(password, user.password_hash)
    if (!valid) {
      return res.status(400).json({ error: '用户名或密码错误' })
    }

    updateLastLogin(user.id)
    const token = generateToken(user.id, username)

    res.json({
      success: true,
      token,
      user: { id: user.id, username },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(500).json({ error: '登录失败' })
  }
})
