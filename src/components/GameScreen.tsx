import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, populateNpcCache } from '@/store/gameStore'
import SaveLoadPanel from '@/components/SaveLoadPanel'

const EMOTION_BACKGROUNDS: Record<string, string> = {
  mysterious: 'from-indigo-950 via-purple-950 to-slate-950',
  warm: 'from-amber-950 via-orange-950 to-rose-950',
  tense: 'from-red-950 via-rose-950 to-slate-950',
  sad: 'from-blue-950 via-indigo-950 to-slate-950',
  hopeful: 'from-emerald-950 via-teal-950 to-cyan-950',
  dark: 'from-gray-950 via-slate-950 to-zinc-950',
  neutral: 'from-slate-950 via-gray-950 to-zinc-950',
  思考中: 'from-indigo-950 via-purple-950 to-slate-950',
  困惑: 'from-amber-950 via-orange-950 to-slate-950',
  平静: 'from-slate-950 via-gray-950 to-zinc-950',
}

const MOOD_LABELS: Record<string, string> = {
  neutral: '💭 平静',
  mysterious: '🔮 神秘',
  warm: '☀️ 温暖',
  tense: '⚡ 紧张',
  sad: '💧 悲伤',
  hopeful: '🌟 希望',
  dark: '🌑 黑暗',
  思考中: '🤔 思考中',
  困惑: '❓ 困惑',
  平静: '💭 平静',
}

export default function GameScreen() {
  const {
    messages, choices, isLoading, emotion, storyDetail, storyId,
    currentNPC, playerAttributes, sendMessage, selectChoice, resetGame, switchNPC,
    token, user, loadSave,
  } = useGameStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load' | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, choices])

  useEffect(() => {
    if (storyDetail) {
      populateNpcCache(storyDetail.id, storyDetail.npcs)
    }
  }, [storyDetail])

  const bgGradient = EMOTION_BACKGROUNDS[emotion] || EMOTION_BACKGROUNDS.neutral
  const showChoices = choices.length > 0 && !isLoading

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim())
      setInput('')
    }
  }

  const npcs = storyDetail?.npcs || []

  return (
    <div className="game-screen flex flex-col">
      {/* Dynamic background */}
      <motion.div
        className={`fixed inset-0 bg-gradient-to-b ${bgGradient} transition-colors duration-[2000ms]`}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Atmospheric particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -300],
              opacity: [0, 0.3, 0],
              x: [null, Math.random() * 80 - 40],
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
      <div className="relative z-30 flex justify-between items-center p-2 sm:p-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 rounded text-sm text-gray-300 transition"
          >
            ← 返回
          </button>
          <span className="text-amber-300 text-sm font-bold">
            {storyDetail?.title || '视觉小说'}
          </span>
          {currentNPC && (
            <span className="text-purple-300 text-sm">
              · 对话中: {npcs.find(n => n.id === currentNPC)?.name || currentNPC}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{MOOD_LABELS[emotion] || emotion}</span>
          {token && (
            <>
              <button
                onClick={() => setSaveLoadMode('save')}
                className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 rounded text-xs text-amber-400 transition"
                title="保存游戏"
              >
                💾
              </button>
              <button
                onClick={() => setSaveLoadMode('load')}
                className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 rounded text-xs text-green-400 transition"
                title="读取存档"
              >
                📂
              </button>
            </>
          )}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 rounded text-sm text-gray-300 transition"
          >
            📊
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                        <div className="text-xs text-purple-400 mb-1">{playerAttributes.name}</div>
                        <p className="text-purple-200">{msg.content}</p>
                      </div>
                    </div>
                  ) : msg.speaker === 'npc' ? (
                    <div className="bg-gray-900/60 border border-gray-700/30 rounded-lg px-5 py-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {(msg.npcName || '?')[0]}
                        </div>
                        <span className="text-purple-400 text-sm font-bold">{msg.npcName}</span>
                        {msg.emotion && (
                          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                            {MOOD_LABELS[msg.emotion] || msg.emotion}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-900/40 border border-gray-700/20 rounded-lg px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-400 text-sm font-bold">📖 旁白</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
                    <span></span><span></span><span></span>
                  </div>
                  <span className="text-gray-400 text-sm">故事正在展开...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sidebar - Player attributes + NPC list */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-72 bg-gray-950/90 border-l border-gray-700/30 overflow-y-auto p-4 shrink-0 backdrop-blur"
            >
              {/* Player info */}
              <div className="mb-6">
                <h3 className="text-amber-300 text-sm font-bold mb-3">👤 {playerAttributes.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: '外貌', value: playerAttributes.appearance, icon: '👤' },
                    { label: '智商', value: playerAttributes.iq, icon: '🧠' },
                    { label: '情商', value: playerAttributes.eq, icon: '💬' },
                    { label: '魅力', value: playerAttributes.charm, icon: '✨' },
                    { label: '口才', value: playerAttributes.eloquence, icon: '🗣️' },
                    { label: '经济', value: playerAttributes.economics, icon: '💰' },
                    { label: '运气', value: playerAttributes.luck, icon: '🍀' },
                  ].map((attr) => (
                    <div key={attr.label} className="bg-gray-800/50 rounded py-2 px-2 text-center">
                      <span>{attr.icon}</span>
                      <div className="text-gray-400">{attr.label}</div>
                      <div className="text-purple-300 font-bold">{attr.value}</div>
                    </div>
                  ))}
                </div>
                {playerAttributes.personality.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-500 text-xs">性格：</span>
                    <span className="text-purple-300 text-xs">
                      {playerAttributes.personality.join('、')}
                    </span>
                  </div>
                )}
              </div>

              {/* NPC list */}
              <div>
                <h3 className="text-amber-300 text-sm font-bold mb-3">👥 角色列表</h3>
                <div className="space-y-2">
                  {npcs.map((npc) => (
                    <button
                      key={npc.id}
                      onClick={() => switchNPC(npc.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                        currentNPC === npc.id
                          ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200'
                          : 'bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold">{npc.name}</div>
                      <div className="text-xs opacity-70">{npc.role}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => switchNPC('_narrator')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                      !currentNPC || currentNPC === '_narrator'
                        ? 'bg-amber-600/20 border border-amber-500/30 text-amber-200'
                        : 'bg-gray-800/50 border border-gray-700/30 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="font-bold">📖 旁白</div>
                    <div className="text-xs opacity-70">自由探索</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom panel - always show input, choices as optional buttons above */}
      <div className="relative z-20 shrink-0">
        {/* Choices as optional quick buttons */}
        {showChoices && (
          <div className="choices-container pb-2">
            <div className="max-w-3xl mx-auto space-y-1.5 px-4">
              {choices.map((choice, index) => (
                <motion.button
                  key={choice}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="choice-button w-full"
                  onClick={() => selectChoice(choice)}
                  disabled={isLoading}
                >
                  <span className="text-purple-400 mr-2">{index + 1}.</span>
                  {choice}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input box - always visible */}
        <div className="dialog-box">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? '等待回应...' : '输入你想说的话或行动...'}
                disabled={isLoading}
                className="flex-1 min-w-0 bg-gray-800/80 border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm sm:text-base placeholder-gray-500 focus:border-purple-500 focus:outline-none transition disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-sm sm:text-base transition"
              >
                发送
              </button>
            </div>
            <div className="mt-1.5 sm:mt-2 text-gray-500 text-xs text-center">
              自由输入你的对话和行动，或点击上方快捷选项
            </div>
          </form>
        </div>
      </div>

      {/* Save/Load Panel */}
      <AnimatePresence>
        {saveLoadMode && token && storyId && (
          <SaveLoadPanel
            mode={saveLoadMode}
            token={token}
            storyId={storyId}
            storyTitle={storyDetail?.title || ''}
            currentData={{
              playerAttributes,
              messages,
              currentNPC,
              phase: useGameStore.getState().phase,
              emotion,
              choices,
            }}
            onLoad={(save) => {
              loadSave(save)
              setSaveLoadMode(null)
            }}
            onClose={() => setSaveLoadMode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
