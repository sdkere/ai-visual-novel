import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export default function DialogBox() {
  const { sendMessage, isLoading } = useGameStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="dialog-box">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? '等待回应...' : '输入你的行动或对话...'}
              disabled={isLoading}
              className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold transition"
          >
            发送
          </button>
        </div>
        <div className="mt-2 text-gray-500 text-xs text-center">
          输入任何你想说的话或想做的事，AI 将根据你的选择推进故事
        </div>
      </form>
    </div>
  )
}
