import { Router } from 'express'
import db from '../db/database.js'

export const visitRouter = Router()

// ===== 建表（启动时自动执行） =====
db.exec(`
  CREATE TABLE IF NOT EXISTS visit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'page_view',
    story_id TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_visit_created ON visit_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_visit_action ON visit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_visit_story ON visit_logs(story_id);
  CREATE INDEX IF NOT EXISTS idx_visit_visitor ON visit_logs(visitor_id);
`)

// ===== 记录访问 =====
visitRouter.post('/track', (req, res) => {
  try {
    const { action, storyId, visitorId } = req.body
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
      || req.socket.remoteAddress
      || ''
    const userAgent = req.headers['user-agent'] || ''

    const vid = visitorId || generateVisitorId(ip, userAgent)

    db.prepare(`
      INSERT INTO visit_logs (visitor_id, action, story_id, ip, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).run(vid, action || 'page_view', storyId || null, ip, userAgent)

    res.json({ success: true, visitorId: vid })
  } catch (error: any) {
    console.error('Visit track error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===== 获取统计数据（管理后台） =====
visitRouter.get('/stats', (_req, res) => {
  try {
    // 总访问人次
    const totalVisits = (db.prepare('SELECT COUNT(*) as count FROM visit_logs').get() as any).count

    // 独立访客数
    const uniqueVisitors = (db.prepare('SELECT COUNT(DISTINCT visitor_id) as count FROM visit_logs').get() as any).count

    // 今日访问
    const todayVisits = (db.prepare(`
      SELECT COUNT(*) as count FROM visit_logs
      WHERE date(created_at) = date('now')
    `).get() as any).count

    // 今日独立访客
    const todayVisitors = (db.prepare(`
      SELECT COUNT(DISTINCT visitor_id) as count FROM visit_logs
      WHERE date(created_at) = date('now')
    `).get() as any).count

    // 各行为类型统计
    const actionStats = db.prepare(`
      SELECT action, COUNT(*) as count
      FROM visit_logs
      GROUP BY action
      ORDER BY count DESC
    `).all()

    // 各剧本访问量
    const storyStats = db.prepare(`
      SELECT story_id, COUNT(*) as count
      FROM visit_logs
      WHERE story_id IS NOT NULL AND action = 'start_game'
      GROUP BY story_id
      ORDER BY count DESC
    `).all()

    // 最近7天每日访问趋势
    const dailyTrend = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as total,
        COUNT(DISTINCT visitor_id) as unique_count
      FROM visit_logs
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all()

    // 最近访问记录
    const recentVisits = db.prepare(`
      SELECT action, story_id, created_at
      FROM visit_logs
      ORDER BY created_at DESC
      LIMIT 50
    `).all()

    res.json({
      summary: {
        totalVisits,
        uniqueVisitors,
        todayVisits,
        todayVisitors,
      },
      actionStats,
      storyStats,
      dailyTrend,
      recentVisits,
    })
  } catch (error: any) {
    console.error('Visit stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===== 实时在线人数（基于最近5分钟活跃） =====
visitRouter.get('/online', (_req, res) => {
  try {
    const result = db.prepare(`
      SELECT COUNT(DISTINCT visitor_id) as count
      FROM visit_logs
      WHERE created_at >= datetime('now', '-5 minutes')
    `).get() as any

    res.json({ online: result.count })
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===== 生成访客ID =====
function generateVisitorId(ip: string, ua: string): string {
  const raw = `${ip}_${ua}_${Date.now()}`
  // Simple hash
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `v_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`
}
