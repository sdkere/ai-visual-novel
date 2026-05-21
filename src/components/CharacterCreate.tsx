import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { PERSONALITY_OPTIONS, DEFAULT_ATTRIBUTES } from '@/types/game'
import type { PlayerAttributes } from '@/types/game'

const MAX_TOTAL_POINTS = 50

export default function CharacterCreate() {
  const { playerAttributes, setPlayerAttributes, startGame, goToCategories, storyDetail } = useGameStore()
  const [step, setStep] = useState<'basic' | 'attributes' | 'confirm'>('basic')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const attrPoints = playerAttributes.appearance + playerAttributes.iq + playerAttributes.eq
    + playerAttributes.charm + playerAttributes.eloquence + playerAttributes.economics + playerAttributes.luck

  const remainingPoints = MAX_TOTAL_POINTS - attrPoints

  const handleAttrChange = (key: keyof PlayerAttributes, value: number) => {
    const clamped = Math.max(1, Math.min(10, value))
    setPlayerAttributes({ [key]: clamped })
  }

  const togglePersonality = (trait: string) => {
    const current = playerAttributes.personality
    if (current.includes(trait)) {
      setPlayerAttributes({ personality: current.filter((t) => t !== trait) })
    } else if (current.length < 4) {
      setPlayerAttributes({ personality: [...current, trait] })
    }
  }

  const SliderRow = ({ label, keyName, icon }: { label: string; keyName: keyof PlayerAttributes; icon: string }) => (
    <div className="flex items-center gap-4">
      <span className="text-lg w-8 text-center">{icon}</span>
      <span className="text-gray-300 w-20 text-sm">{label}</span>
      <input
        type="range"
        min={1}
        max={10}
        value={playerAttributes[keyName] as number}
        onChange={(e) => handleAttrChange(keyName, parseInt(e.target.value))}
        className="flex-1 accent-purple-500 h-2"
      />
      <span className="text-purple-300 font-bold w-8 text-center">{playerAttributes[keyName] as number}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121f] to-[#0a0a0f] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (step === 'basic') goToCategories()
              else if (step === 'attributes') setStep('basic')
              else setStep('attributes')
            }}
            className="text-gray-400 hover:text-amber-400 transition text-sm mb-4"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-amber-300 mb-2">创建你的角色</h1>
          <p className="text-gray-400">
            {storyDetail ? `进入「${storyDetail.title}」` : '自定义你的角色属性'}
          </p>

          {/* Step indicator */}
          <div className="flex gap-3 mt-4">
            {[
              { id: 'basic', label: '基本信息' },
              { id: 'attributes', label: '属性分配' },
              { id: 'confirm', label: '确认' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id as any)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  step === s.id
                    ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                    : 'bg-gray-800/50 border border-gray-700/30 text-gray-500 hover:text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Basic Info */}
          {step === 'basic' && (
            <div className="space-y-6">
              <div className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-6 space-y-5">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">姓名</label>
                  <input
                    type="text"
                    value={playerAttributes.name}
                    onChange={(e) => setPlayerAttributes({ name: e.target.value })}
                    placeholder="输入你的名字"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">性别</label>
                  <div className="flex gap-3">
                    {['男', '女', '其他'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setPlayerAttributes({ gender: g })}
                        className={`flex-1 py-3 rounded-lg border transition ${
                          playerAttributes.gender === g
                            ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">年龄: {playerAttributes.age}</label>
                  <input
                    type="range"
                    min={16}
                    max={60}
                    value={playerAttributes.age}
                    onChange={(e) => setPlayerAttributes({ age: parseInt(e.target.value) })}
                    className="w-full accent-purple-500 h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>16</span><span>60</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">身高: {playerAttributes.height}cm</label>
                    <input
                      type="range"
                      min={150}
                      max={200}
                      value={playerAttributes.height}
                      onChange={(e) => setPlayerAttributes({ height: parseInt(e.target.value) })}
                      className="w-full accent-purple-500 h-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">体重: {playerAttributes.weight}kg</label>
                    <input
                      type="range"
                      min={40}
                      max={120}
                      value={playerAttributes.weight}
                      onChange={(e) => setPlayerAttributes({ weight: parseInt(e.target.value) })}
                      className="w-full accent-purple-500 h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Personality */}
              <div className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-6">
                <label className="block text-gray-400 mb-3 text-sm">
                  性格特征（最多选 4 个）
                </label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_OPTIONS.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => togglePersonality(trait)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition ${
                        playerAttributes.personality.includes(trait)
                          ? 'bg-purple-600/40 border border-purple-500/50 text-purple-200'
                          : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  已选: {playerAttributes.personality.join('、') || '无'}
                </p>
              </div>

              <button
                onClick={() => setStep('attributes')}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition"
              >
                下一步：分配属性点
              </button>
            </div>
          )}

          {/* Step 2: Attributes */}
          {step === 'attributes' && (
            <div className="space-y-6">
              <div className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-purple-200">属性分配</h3>
                  <span className={`text-sm font-bold ${remainingPoints < 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    剩余点数: {remainingPoints}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mb-5">
                  总计 {MAX_TOTAL_POINTS} 点，每项 1-10。属性会影响 NPC 对你的态度和剧情走向。
                </p>
                <div className="space-y-4">
                  <SliderRow label="外貌" keyName="appearance" icon="👤" />
                  <SliderRow label="智商" keyName="iq" icon="🧠" />
                  <SliderRow label="情商" keyName="eq" icon="💬" />
                  <SliderRow label="魅力" keyName="charm" icon="✨" />
                  <SliderRow label="口才" keyName="eloquence" icon="🗣️" />
                  <SliderRow label="经济" keyName="economics" icon="💰" />
                  <SliderRow label="运气" keyName="luck" icon="🍀" />
                </div>
              </div>

              {/* Attribute tips */}
              <div className="bg-gray-900/40 border border-gray-700/20 rounded-xl p-5">
                <h4 className="text-amber-300 text-sm font-bold mb-3">💡 属性影响提示</h4>
                <ul className="text-gray-400 text-xs space-y-1.5">
                  <li>🧠 <strong>智商</strong>：发现隐藏线索、理解复杂关系</li>
                  <li>💬 <strong>情商</strong>：理解 NPC 情绪、察觉言外之意</li>
                  <li>✨ <strong>魅力</strong>：NPC 更愿意信任你、透露秘密</li>
                  <li>🗣️ <strong>口才</strong>：说服 NPC、化解矛盾</li>
                  <li>💰 <strong>经济</strong>：获得更好的社会地位和资源</li>
                  <li>🍀 <strong>运气</strong>：影响随机事件的走向</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('basic')}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  上一步
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={remainingPoints < 0}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  下一步：确认
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-gray-900/60 border border-gray-700/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-purple-200 mb-5">角色确认</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-gray-500 text-xs">姓名</span>
                    <p className="text-white">{playerAttributes.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">性别</span>
                    <p className="text-white">{playerAttributes.gender}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">年龄</span>
                    <p className="text-white">{playerAttributes.age} 岁</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">身高/体重</span>
                    <p className="text-white">{playerAttributes.height}cm / {playerAttributes.weight}kg</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-500 text-xs">性格</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {playerAttributes.personality.map((t) => (
                      <span key={t} className="px-2 py-1 bg-purple-900/40 border border-purple-700/30 rounded text-xs text-purple-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: '外貌', value: playerAttributes.appearance, icon: '👤' },
                    { label: '智商', value: playerAttributes.iq, icon: '🧠' },
                    { label: '情商', value: playerAttributes.eq, icon: '💬' },
                    { label: '魅力', value: playerAttributes.charm, icon: '✨' },
                    { label: '口才', value: playerAttributes.eloquence, icon: '🗣️' },
                    { label: '经济', value: playerAttributes.economics, icon: '💰' },
                    { label: '运气', value: playerAttributes.luck, icon: '🍀' },
                  ].map((attr) => (
                    <div key={attr.label} className="text-center bg-gray-800/50 rounded-lg py-3">
                      <span className="text-lg">{attr.icon}</span>
                      <p className="text-xs text-gray-400 mt-1">{attr.label}</p>
                      <p className="text-purple-300 font-bold">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('attributes')}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  修改属性
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  🎮 进入游戏
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
