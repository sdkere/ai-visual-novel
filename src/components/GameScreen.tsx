import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import DialogBox from './DialogBox'
import ChoicePanel from './ChoicePanel'

// Background gradients for different emotions
const EMOTION_BACKGROUNDS: Record<string, string> = {
  mysterious: 'from-indigo-950 via-purple-950 to-slate-950',
  warm: 'from-amber-950 via-orange-950 to-rose-950',
  tense: 'from-red-950 via-rose-950 to-slate-950',
  sad: 'from-blue-950 via-indigo-950 to-slate-950',
  hopeful: 'from-emerald-950 via-teal-950 to-cyan-950',
  dark: 'from-gray-950 via-slate-950 to-zinc-950',
  neutral: 'from-slate-950 via-gray-950 to-zinc-950',
}

export default function GameScreen() {
  const { messages, choices, isLoading, emotion, resetGame } = useGameStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, choices])

  const bgGradient = EMOTION_BACKGROUNDS[emotion] || EMOTION_BACKGROUNDS.neutral
  const showChoices = choices.length > 0 && !isLoading

  return (
    <div className="game-screen flex flex-col">
      {/* Dynamic background */}
      <motion.div
        className={`fixed inset-0 bg-gradient-to-b ${bgGradient} transition-colors duration-2000`}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Atmospheric particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -300],
              opacity: [0, 0.4, 0],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Header bar */}
      <div className="relative z-30 flex justify-between items-center p-4 shrink-0">
        <div className="text-purple-300 text-sm">幻境·迷雾森林</div>
        <button
          onClick={resetGame}
          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 rounded text-sm text-gray-300 transition"
        >
          返回主菜单
        </button>
      </div>

      {/* Messages area - takes remaining space */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index === messages.length - 1 ? 0.3 : 0 }}
              >
                {msg.speaker === 'player' ? (
                  <div className="flex justify-end">
                    <div className="bg-purple-600/30 border border-purple-500/30 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-purple-200">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900/60 border border-gray-700/30 rounded-lg px-5 py-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 text-sm font-bold">旁白</span>
                      {msg.emotion && (
                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                          {getEmotionLabel(msg.emotion)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/60 border border-gray-700/30 rounded-lg px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-gray-400 text-sm">故事正在展开...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom panel - Choices or Dialog input */}
      <div className="relative z-20 shrink-0">
        <AnimatePresence mode="wait">
          {showChoices ? (
            <motion.div
              key="choices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ChoicePanel />
            </motion.div>
          ) : (
            <motion.div
              key="dialog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogBox />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function getEmotionLabel(emotion: string): string {
  const labels: Record<string, string> = {
    mysterious: '🔮 神秘',
    warm: '☀️ 温暖',
    tense: '⚡ 紧张',
    sad: '💧 悲伤',
    hopeful: '🌟 希望',
    dark: '🌑 黑暗',
    neutral: '💭 平静',
  }
  return labels[emotion] || emotion
}
