/**
 * 访问统计追踪工具
 * 轻量级埋点，不影响游戏主逻辑
 */

const VISITOR_ID_KEY = 'vn_visitor_id'
const TRACKED_KEY = 'vn_last_track_time'

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = `v_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

// 防止频繁上报（同一动作 10 秒内不重复）
function shouldThrottle(action: string): boolean {
  const last = sessionStorage.getItem(`${TRACKED_KEY}_${action}`)
  if (last && Date.now() - parseInt(last) < 10000) return true
  sessionStorage.setItem(`${TRACKED_KEY}_${action}`, Date.now().toString())
  return false
}

/**
 * 上报访问事件
 * @param action 动作类型：page_view | start_game | view_story | switch_npc
 * @param storyId 关联的剧本ID（可选）
 */
export async function trackVisit(action: string, storyId?: string) {
  try {
    if (shouldThrottle(action)) return

    await fetch('/api/visit/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        storyId: storyId || null,
        visitorId: getVisitorId(),
      }),
    }).catch(() => {
      // 静默失败，不影响用户体验
    })
  } catch {
    // 静默失败
  }
}

/**
 * 页面访问（首次加载）
 */
export function trackPageView() {
  trackVisit('page_view')
}

/**
 * 开始游戏
 */
export function trackStartGame(storyId: string) {
  trackVisit('start_game', storyId)
}

/**
 * 查看剧本详情
 */
export function trackViewStory(storyId: string) {
  trackVisit('view_story', storyId)
}
