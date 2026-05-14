import { create } from 'zustand'
import type { GameState, Message, ChatResponse } from '@/types/game'

interface GameStore extends GameState {
  // Actions
  setPlayerName: (name: string) => void
  startGame: (worldId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  selectChoice: (choice: string) => Promise<void>
  resetGame: () => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
}

const API_BASE = '/api'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  sessionId: null,
  worldId: null,
  sceneId: 'start',
  messages: [],
  choices: [],
  isLoading: false,
  emotion: 'neutral',
  playerName: '旅行者',

  setPlayerName: (name: string) => {
    set({ playerName: name })
  },

  startGame: async (worldId: string) => {
    const sessionId = generateSessionId()
    set({
      sessionId,
      worldId,
      sceneId: 'start',
      messages: [],
      choices: [],
      isLoading: true,
    })

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          worldId,
          message: '开始探索',
          playerName: get().playerName,
        }),
      })

      if (!response.ok) throw new Error('Failed to start game')

      const data: ChatResponse = await response.json()

      set({
        messages: [
          {
            id: generateId(),
            speaker: 'narrator',
            content: data.content,
            emotion: data.emotion,
            timestamp: Date.now(),
          },
        ],
        choices: data.choices,
        sceneId: data.sceneId,
        emotion: data.emotion,
        isLoading: false,
      })
    } catch (error) {
      console.error('Start game error:', error)
      set({
        messages: [
          {
            id: generateId(),
            speaker: 'narrator',
            content: '迷雾森林的故事即将开始...',
            timestamp: Date.now(),
          },
        ],
        choices: ['踏入森林', '观察四周'],
        isLoading: false,
      })
    }
  },

  sendMessage: async (content: string) => {
    const { sessionId, worldId, playerName } = get()
    if (!sessionId || !worldId) return

    // Add player message immediately
    const playerMessage: Message = {
      id: generateId(),
      speaker: 'player',
      content,
      timestamp: Date.now(),
    }

    set((state) => ({
      messages: [...state.messages, playerMessage],
      choices: [],
      isLoading: true,
    }))

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, worldId, message: content, playerName }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data: ChatResponse = await response.json()

      const narratorMessage: Message = {
        id: generateId(),
        speaker: 'narrator',
        content: data.content,
        emotion: data.emotion,
        timestamp: Date.now(),
      }

      set((state) => ({
        messages: [...state.messages, narratorMessage],
        choices: data.choices,
        sceneId: data.sceneId,
        emotion: data.emotion,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Send message error:', error)
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: generateId(),
            speaker: 'narrator',
            content: '（故事暂时中断，请稍后再试）',
            timestamp: Date.now(),
          },
        ],
        choices: ['继续', '返回主菜单'],
        isLoading: false,
      }))
    }
  },

  selectChoice: async (choice: string) => {
    await get().sendMessage(choice)
  },

  resetGame: () => {
    set({
      sessionId: null,
      worldId: null,
      sceneId: 'start',
      messages: [],
      choices: [],
      isLoading: false,
      emotion: 'neutral',
    })
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, { ...message, id: generateId(), timestamp: Date.now() }],
    }))
  },
}))
