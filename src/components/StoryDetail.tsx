import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore, populateNpcCache } from '@/store/gameStore'

export default function StoryDetail() {
  const { storyDetail, selectedStoryId, goToCharacterCreate, goToCategories, isLoading } = useGameStore()

  useEffect(() => {
    if (storyDetail) {
      populateNpcCache(storyDetail.id, storyDetail.npcs)
    }
  }, [storyDetail])

  if (isLoading || !storyDetail) {
    return (
      <div className="main-menu">
        <div className="text-gray-400 text-lg">
          <div className="loading-dots mb-4">
            <span></span><span></span><span></span>
          </div>
          加载中...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] overflow-y-auto">
      {/* Hero section */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-b from-purple-950/50 to-transparent flex items-end">
          <div className="max-w-4xl mx-auto w-full px-6 pb-6">
            <button
              onClick={goToCategories}
              className="mb-4 text-gray-400 hover:text-amber-400 transition text-sm"
            >
              ← 返回
            </button>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-amber-300 mb-2"
            >
              {storyDetail.title}
            </motion.h1>
            <p className="text-purple-300/70 text-lg">{storyDetail.subtitle}</p>
            <div className="flex gap-2 mt-3">
              {storyDetail.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-purple-900/40 border border-purple-700/30 rounded-full text-xs text-purple-300">
                  {tag}
                </span>
              ))}
              <span className="px-3 py-1 bg-amber-900/30 border border-amber-700/30 rounded-full text-xs text-amber-400">
                {storyDetail.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* Background */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
            <span>📜</span> 故事背景
          </h2>
          <div className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {storyDetail.background}
            </p>
          </div>
        </motion.section>

        {/* Characters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
            <span>👥</span> 人物介绍
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storyDetail.npcs.map((npc, index) => (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-5 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-amber-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                    {npc.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-200">{npc.name}</h3>
                    <p className="text-amber-400/70 text-sm">{npc.role} · {npc.age}岁</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-2">{npc.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-blue-900/30 border border-blue-700/30 rounded text-xs text-blue-300">
                    {npc.personality}
                  </span>
                  <span className="px-2 py-0.5 bg-green-900/30 border border-green-700/30 rounded text-xs text-green-300">
                    {npc.speechStyle}
                  </span>
                </div>
                {npc.relationships && (
                  <p className="text-gray-500 text-xs mt-3 border-t border-gray-800 pt-3">
                    🔗 {npc.relationships}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Game intro */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
            <span>🎮</span> 游戏介绍
          </h2>
          <div className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {storyDetail.gameIntro}
            </p>
          </div>
        </motion.section>

        {/* Phases */}
        {storyDetail.phases.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <span>📋</span> 剧情阶段
            </h2>
            <div className="space-y-3">
              {storyDetail.phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className="bg-gray-900/60 border border-gray-700/30 rounded-lg px-5 py-4 flex items-start gap-4"
                >
                  <div className="w-8 h-8 bg-purple-900/50 border border-purple-700/50 rounded-full flex items-center justify-center text-purple-300 text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-purple-200 font-bold">{phase.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Endings */}
        {storyDetail.endings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <span>🎭</span> 结局方向
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {storyDetail.endings.map((ending) => (
                <div
                  key={ending.id}
                  className="bg-gray-900/60 border border-gray-700/30 rounded-lg px-5 py-4"
                >
                  <h4 className="text-amber-300 font-bold mb-1">{ending.title}</h4>
                  <p className="text-gray-400 text-sm">{ending.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center py-8"
        >
          <button
            onClick={goToCharacterCreate}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 rounded-xl text-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-900/30"
          >
            🎮 开始游戏
          </button>
          <p className="text-gray-500 text-sm mt-3">创建你的角色，进入故事世界</p>
        </motion.div>
      </div>
    </div>
  )
}
