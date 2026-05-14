import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { World } from '@/types/game'

export default function MainMenu() {
  const { startGame, setPlayerName, playerName } = useGameStore()
  const [worlds, setWorlds] = useState<World[]>([])
  const [showNameInput, setShowNameInput] = useState(false)
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null)
  const [inputName, setInputName] = useState('')

  useEffect(() => {
    fetch('/api/story/worlds')
      .then((res) => res.json())
      .then(setWorlds)
      .catch(console.error)
  }, [])

  const handleWorldSelect = (worldId: string) => {
    setSelectedWorld(worldId)
    setShowNameInput(true)
  }

  const handleStart = () => {
    if (inputName.trim()) {
      setPlayerName(inputName.trim())
    }
    if (selectedWorld) {
      startGame(selectedWorld)
    }
  }

  return (
    <div className="main-menu">
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="menu-title">幻境</h1>
        <p className="menu-subtitle">AI 驱动的视觉小说体验</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showNameInput ? (
          <motion.div
            key="worlds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 w-full flex flex-col items-center gap-6"
          >
            <p className="text-gray-400 mb-4">选择你的冒险</p>
            {worlds.map((world, index) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="world-card"
                onClick={() => handleWorldSelect(world.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-3xl">
                    🌲
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-purple-300">{world.title}</h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{world.description}</p>
                    <div className="flex gap-2 mt-3">
                      {world.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-purple-900/50 rounded text-xs text-purple-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">⏱ {world.estimatedPlayTime}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="z-10 w-full max-w-md px-6"
          >
            <div className="bg-gray-900/80 border border-purple-500/30 rounded-xl p-8 backdrop-blur">
              <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">创建你的角色</h2>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">你的名字</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={playerName}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition"
                  onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNameInput(false)
                    setSelectedWorld(null)
                  }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  返回
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition font-bold"
                >
                  开始冒险
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
