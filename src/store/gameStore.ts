import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GameState, Message, ChatResponse, PlayerAttributes,
  StoryDetail, StoryCategory, StorySummary,
} from '@/types/game'
import { DEFAULT_ATTRIBUTES } from '@/types/game'

interface GameStore extends GameState {
  // Auth
  setAuth: (token: string, user: { id: number; username: string }) => void
  logout: () => void

  // Navigation
  goToCategories: () => void
  goToStoryList: (categoryId: string) => void
  goToStoryDetail: (storyId: string) => void
  goToCharacterCreate: () => void
  startGame: () => Promise<void>
  resumeGame: () => void
  loadSave: (saveData: any) => void

  // Player
  setPlayerAttributes: (attrs: Partial<PlayerAttributes>) => void

  // Game
  sendMessage: (content: string) => Promise<void>
  selectChoice: (choice: string) => void
  switchNPC: (npcId: string) => void
  resetGame: () => void
}

const API_BASE = '/api'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      view: 'categories',
      selectedCategory: null,
      selectedStoryId: null,
      sessionId: null,
      storyId: null,
      currentNPC: null,
      playerAttributes: { ...DEFAULT_ATTRIBUTES },
      messages: [],
      choices: [],
      isLoading: false,
      emotion: 'neutral',
      phase: 'phase_1',
      currentPhaseIndex: 0,
      storyDetail: null,

      // ===== Auth =====

      setAuth: (token: string, user: { id: number; username: string }) => {
        set({ token, user })
      },

      logout: () => {
        set({
          token: null,
          user: null,
          view: 'categories',
          sessionId: null,
          storyId: null,
          currentNPC: null,
          messages: [],
          choices: [],
          isLoading: false,
          emotion: 'neutral',
          phase: 'phase_1',
          currentPhaseIndex: 0,
          storyDetail: null,
        })
      },

      // ===== Navigation =====

      goToCategories: () => {
        set({
          view: 'categories',
          selectedCategory: null,
          selectedStoryId: null,
          storyDetail: null,
        })
      },

      goToStoryList: (categoryId: string) => {
        set({
          view: 'storyList',
          selectedCategory: categoryId,
          selectedStoryId: null,
          storyDetail: null,
        })
      },

      goToStoryDetail: async (storyId: string) => {
        set({ view: 'storyDetail', selectedStoryId: storyId, isLoading: true })
        try {
          const res = await fetch(`/api/story/stories/${storyId}`)
          const detail: StoryDetail = await res.json()
          set({ storyDetail: detail, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      goToCharacterCreate: () => {
        const { storyDetail } = get()
        set({
          view: 'characterCreate',
          playerAttributes: storyDetail?.defaultAttributes
            ? { ...DEFAULT_ATTRIBUTES, ...storyDetail.defaultAttributes }
            : { ...DEFAULT_ATTRIBUTES },
        })
      },

      // Resume saved game (go directly to game view without calling API)
      resumeGame: () => {
        const { storyId } = get()
        if (storyId) {
          set({ view: 'game', isLoading: false })
        }
      },

      // Load a save from server
      loadSave: (save: any) => {
        set({
          view: 'game',
          storyId: save.story_id,
          sessionId: generateSessionId(),
          playerAttributes: save.player_attributes,
          messages: save.messages,
          currentNPC: save.current_npc || null,
          phase: save.phase || 'phase_1',
          emotion: save.emotion || 'neutral',
          choices: save.choices || [],
          isLoading: false,
        })
      },

      startGame: async () => {
        const { selectedStoryId, playerAttributes } = get()
        if (!selectedStoryId) return

        const sessionId = generateSessionId()
        const storyId = selectedStoryId

        set({
          view: 'game',
          sessionId,
          storyId,
          currentNPC: null,
          messages: [],
          choices: [],
          isLoading: true,
          phase: 'phase_1',
          currentPhaseIndex: 0,
        })

        try {
          const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyId,
              npcId: '_narrator',
              message: '游戏开始，请描述开场场景',
              playerAttributes,
              history: [],
              phase: 'phase_1',
            }),
          })
          const data: ChatResponse = await res.json()

          set({
            messages: [{
              id: generateId(),
              speaker: 'narrator',
              content: data.reply,
              emotion: data.mood,
              timestamp: Date.now(),
            }],
            choices: data.choices || [],
            emotion: data.mood || 'neutral',
            isLoading: false,
          })
        } catch {
          set({
            messages: [{
              id: generateId(),
              speaker: 'narrator',
              content: '（故事即将开始...）',
              timestamp: Date.now(),
            }],
            isLoading: false,
          })
        }
      },

      // ===== Player =====

      setPlayerAttributes: (attrs: Partial<PlayerAttributes>) => {
        set((state) => ({
          playerAttributes: { ...state.playerAttributes, ...attrs },
        }))
      },

      // ===== Game =====

      sendMessage: async (content: string) => {
        const { sessionId, storyId, currentNPC, playerAttributes, phase } = get()
        if (!sessionId || !storyId) return

        const playerMsg: Message = {
          id: generateId(),
          speaker: 'player',
          content,
          timestamp: Date.now(),
        }

        set((state) => ({
          messages: [...state.messages, playerMsg],
          choices: [],
          isLoading: true,
        }))

        // Build history for API
        const history = get().messages.slice(-20).map((m) => ({
          role: m.speaker === 'player' ? 'user' as const : 'assistant' as const,
          content: m.speaker === 'player'
            ? m.content
            : `[${m.npcName || '旁白'}] ${m.content}`,
        }))

        const npcId = currentNPC || '_narrator'

        try {
          const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyId,
              npcId,
              message: content,
              playerAttributes,
              history,
              phase,
            }),
          })
          const data: ChatResponse = await res.json()

          // Determine speaker
          const isNarrator = npcId === '_narrator' || !currentNPC

          const npcMsg: Message = {
            id: generateId(),
            speaker: isNarrator ? 'narrator' : 'npc',
            npcId: isNarrator ? undefined : npcId,
            npcName: isNarrator ? undefined : getNpcName(storyId, npcId),
            content: data.reply,
            emotion: data.mood,
            timestamp: Date.now(),
          }

          set((state) => ({
            messages: [...state.messages, npcMsg],
            choices: data.choices || [],
            emotion: data.mood || state.emotion,
            isLoading: false,
          }))
        } catch {
          set((state) => ({
            messages: [...state.messages, {
              id: generateId(),
              speaker: 'narrator' as const,
              content: '（故事暂时中断...）',
              timestamp: Date.now(),
            }],
            isLoading: false,
          }))
        }
      },

      selectChoice: (choice: string) => {
        // Parse choice if it contains NPC reference like "@npc_id:对话内容"
        const npcMatch = choice.match(/^@(\w+)[：:](.+)/)
        if (npcMatch) {
          const [, npcId, msg] = npcMatch
          set({ currentNPC: npcId })
          get().sendMessage(msg)
        } else {
          get().sendMessage(choice)
        }
      },

      switchNPC: (npcId: string) => {
        set({ currentNPC: npcId })
      },

      resetGame: () => {
        set({
          view: 'categories',
          selectedCategory: null,
          selectedStoryId: null,
          sessionId: null,
          storyId: null,
          currentNPC: null,
          messages: [],
          choices: [],
          isLoading: false,
          emotion: 'neutral',
          phase: 'phase_1',
          currentPhaseIndex: 0,
          storyDetail: null,
        })
      },
    }),
    {
      name: 'visual-novel-game-state',
      // Only persist these fields (skip isLoading, storyDetail which are transient)
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        view: state.view,
        selectedCategory: state.selectedCategory,
        selectedStoryId: state.selectedStoryId,
        sessionId: state.sessionId,
        storyId: state.storyId,
        currentNPC: state.currentNPC,
        playerAttributes: state.playerAttributes,
        messages: state.messages,
        choices: state.choices,
        emotion: state.emotion,
        phase: state.phase,
        currentPhaseIndex: state.currentPhaseIndex,
      }),
    }
  )
)

// Helper to get NPC name from story data (cached)
const npcNameCache: Record<string, Record<string, string>> = {}

function getNpcName(storyId: string, npcId: string): string {
  if (npcNameCache[storyId]?.[npcId]) return npcNameCache[storyId][npcId]
  // Will be populated when story detail is loaded
  return npcId
}

export function populateNpcCache(storyId: string, npcs: { id: string; name: string }[]) {
  if (!npcNameCache[storyId]) npcNameCache[storyId] = {}
  for (const npc of npcs) {
    npcNameCache[storyId][npc.id] = npc.name
  }
}
