import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { StorySummary } from '@/types/game'

export default function StoryList() {
  const { selectedCategory, goToStoryDetail, goToCategories } = useGameStore()
  const [stories, setStories] = useState<StorySummary[]>([])
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    fetch('/api/story/categories')
      .then((res) => res.json())
      .then((cats: any[]) => {
        const cat = cats.find((c) => c.id === selectedCategory)
        if (cat) {
          setCategoryName(cat.name)
          setStories(cat.stories)
        }
      })
      .catch(console.error)
  }, [selectedCategory])

  const difficultyColor: Record<string, string> = {
    '简单': 'text-green-400 bg-green-900/30 border-green-700/30',
    '中等': 'text-yellow-400 bg-yellow-900/30 border-yellow-700/30',
    '困难': 'text-red-400 bg-red-900/30 border-red-700/30',
  }

  // 滚动到顶部
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="main-menu">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-20"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-3xl px-6 mb-8"
      >
        <button
          onClick={goToCategories}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-amber-400 transition"
        >
          <span className="text-lg">←</span>
          <span>返回分类</span>
        </button>
        <h2 className="text-3xl font-bold text-amber-300">{categoryName}</h2>
        <p className="text-gray-400 mt-2">选择一个故事开始冒险</p>
      </motion.div>

      {/* Story cards - grid with covers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="z-10 w-full max-w-4xl px-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="world-card group cursor-pointer"
              onClick={() => goToStoryDetail(story.id)}
            >
              {/* Cover with overlay */}
              <div className="relative h-44 rounded-t-lg overflow-hidden">
                {story.cover ? (
                  <img src={story.cover} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-800 to-amber-800 flex items-center justify-center text-5xl">
                    📖
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Title on cover */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white mb-0.5 drop-shadow-lg">{story.title}</h3>
                  <p className="text-amber-300/80 text-xs drop-shadow">{story.subtitle}</p>
                </div>
              </div>
              {/* Info below cover */}
              <div className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs border ${difficultyColor[story.difficulty] || 'text-gray-400 bg-gray-800 border-gray-600'}`}>
                    {story.difficulty}
                  </span>
                  {story.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-purple-900/40 border border-purple-700/30 rounded text-xs text-purple-300">
                      {tag}
                    </span>
                  ))}
                  <span className="text-gray-500 text-xs ml-auto">{story.npcCount} 角色</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-4xl mb-4">📭</p>
            <p>该分类下暂无故事</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
