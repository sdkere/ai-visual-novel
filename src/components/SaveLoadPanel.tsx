import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SaveSlot {
  id: number
  save_name: string
  story_id: string
  story_title: string
  message_count: number
  phase: string
  created_at: string
  updated_at: string
}

interface SaveLoadPanelProps {
  mode: 'save' | 'load'
  token: string
  storyId: string
  storyTitle: string
  currentData: {
    playerAttributes: any
    messages: any[]
    currentNPC: string | null
    phase: string
    emotion: string
    choices: string[]
  }
  onLoad: (save: any) => void
  onClose: () => void
}

export default function SaveLoadPanel({
  mode, token, storyId, storyTitle, currentData, onLoad, onClose,
}: SaveLoadPanelProps) {
  const [saves, setSaves] = useState<SaveSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSaves()
  }, [])

  const fetchSaves = async () => {
    try {
      const res = await fetch(`/api/saves/story/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSaves(await res.json())
      }
    } catch { } finally {
      setLoading(false)
    }
  }

  const handleSave = async (saveId?: number) => {
    setSaving(true)
    setError('')
    try {
      const body = {
        saveName: saveName || `存档 ${new Date().toLocaleString('zh-CN')}`,
        storyId,
        storyTitle,
        playerAttributes: currentData.playerAttributes,
        messages: currentData.messages,
        currentNPC: currentData.currentNPC,
        phase: currentData.phase,
        emotion: currentData.emotion,
        choices: currentData.choices,
        messageCount: currentData.messages.length,
      }

      const url = saveId ? `/api/saves/${saveId}` : '/api/saves'
      const method = saveId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        if (saveId) {
          onClose()
        } else {
          setSaveName('')
          fetchSaves()
        }
      } else {
        const data = await res.json()
        setError(data.error || '保存失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = async (saveId: number) => {
    try {
      const res = await fetch(`/api/saves/${saveId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const save = await res.json()
        onLoad(save)
      }
    } catch { }
  }

  const handleDelete = async (saveId: number) => {
    if (!confirm('确定要删除这个存档吗？')) return
    try {
      await fetch(`/api/saves/${saveId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchSaves()
    } catch { }
  }

  const phaseLabel: Record<string, string> = {
    phase_1: '初入滨海',
    phase_2: '暗流涌动',
    phase_3: '旧事重提',
    phase_4: '矛盾激化',
    phase_5: '雷雨之夜',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-bold text-amber-300">
            {mode === 'save' ? '💾 保存游戏' : '📂 读取存档'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>

        {/* Save input (only in save mode) */}
        {mode === 'save' && (
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="输入存档名称（可选）"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-lg text-sm font-bold transition"
              >
                {saving ? '保存中...' : '新建存档'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        )}

        {/* Save list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center text-gray-400 py-8">加载中...</div>
          ) : saves.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-3xl mb-2">📭</p>
              <p>{mode === 'save' ? '还没有存档' : '没有找到存档'}</p>
            </div>
          ) : (
            saves.map((save) => (
              <div
                key={save.id}
                className="bg-gray-800/60 border border-gray-700/30 rounded-lg p-3 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-200 font-bold text-sm">{save.save_name}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(save.updated_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span>{save.message_count} 条对话</span>
                  <span>{phaseLabel[save.phase] || save.phase}</span>
                </div>
                <div className="flex gap-2">
                  {mode === 'save' ? (
                    <button
                      onClick={() => handleSave(save.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-amber-600/30 border border-amber-600/40 hover:bg-amber-600/50 rounded text-xs text-amber-300 transition"
                    >
                      覆盖保存
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLoad(save.id)}
                      className="px-3 py-1 bg-purple-600/30 border border-purple-600/40 hover:bg-purple-600/50 rounded text-xs text-purple-300 transition"
                    >
                      读取
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(save.id)}
                    className="px-3 py-1 bg-red-600/20 border border-red-600/30 hover:bg-red-600/40 rounded text-xs text-red-400 transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
