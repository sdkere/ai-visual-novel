import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import AuthPanel from '@/components/AuthPanel'
import type { StoryCategory } from '@/types/game'

export default function CategoryList() {
  const { goToStoryList, resumeGame, messages, storyId, user, token, setAuth, logout } = useGameStore()
  const [categories, setCategories] = useState<StoryCategory[]>([])
  const [showAuth, setShowAuth] = useState(false)

  const hasSavedGame = messages.length > 0 && storyId

  useEffect(() => {
    fetch('/api/story/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  const handleAuth = (newToken: string, newUser: { id: number; username: string }) => {
    setAuth(newToken, newUser)
    setShowAuth(false)
  }

  return (
    <div className="main-menu">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, Math.random() * -300],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Top right: user info or login button */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-purple-300 text-sm">👤 {user.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 rounded text-xs text-gray-400 transition"
            >
              退出
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-1.5 bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 rounded-lg text-sm text-purple-300 transition"
          >
            登录 / 注册
          </button>
        )}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 mb-6"
      >
        <h1 className="menu-title" style={{
          fontSize: '3.5rem',
          background: 'linear-gradient(135deg, #d4a574, #c9a0dc, #f0c27f)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI 视觉小说世界
        </h1>
        <p className="menu-subtitle mt-3">沉浸式互动叙事体验 · AI 驱动角色对话</p>
      </motion.div>

      {/* Continue button */}
      {hasSavedGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="z-10 mb-6 w-full max-w-md px-6"
        >
          <button
            onClick={resumeGame}
            className="w-full py-4 bg-gradient-to-r from-purple-600/40 to-amber-600/40 border border-purple-500/40 hover:border-amber-500/50 rounded-xl text-lg font-bold text-amber-200 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-900/20"
          >
            ▶ 继续游戏
          </button>
          <p className="text-center text-gray-500 text-xs mt-2">
            已保存 {messages.length} 条对话记录
          </p>
        </motion.div>
      )}

      {/* Category Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="z-10 w-full max-w-4xl px-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="world-card cursor-pointer group"
              onClick={() => goToStoryList(cat.id)}
            >
              <div className="flex flex-col items-center text-center p-4">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-amber-300 mb-2">{cat.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{cat.description}</p>
                <span className="px-3 py-1 bg-amber-900/30 border border-amber-700/30 rounded-full text-xs text-amber-400">
                  {cat.storyCount} 个故事
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        className="z-10 mt-8 text-gray-500 text-sm"
      >
        {hasSavedGame ? '或选择一个新故事' : '选择一个分类，开始你的故事'}
      </motion.p>

      {!user && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.2 }}
          className="z-10 mt-2 text-gray-600 text-xs"
        >
          登录后可云端保存存档，多设备同步
        </motion.p>
      )}

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4"
            onClick={() => setShowAuth(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AuthPanel onAuth={handleAuth} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
