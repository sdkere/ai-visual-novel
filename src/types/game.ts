// ===== Story & Category Types =====

export interface StoryCategory {
  id: string
  name: string
  icon: string
  description: string
  storyCount: number
}

export interface StorySummary {
  id: string
  title: string
  subtitle: string
  cover: string
  category: string
  difficulty: string
  tags: string[]
  npcCount: number
}

export interface StoryDetail {
  id: string
  title: string
  subtitle: string
  category: string
  categoryIcon: string
  categoryDesc: string
  cover: string
  difficulty: string
  tags: string[]
  background: string
  playerRole: string
  intro: string
  gameIntro: string
  npcs: NPCInfo[]
  phases: StoryPhase[]
  endings: StoryEnding[]
  defaultAttributes: PlayerAttributes
}

export interface NPCInfo {
  id: string
  name: string
  age: number
  role: string
  personality: string
  appearance: string
  speechStyle: string
  description: string
  relationships: string
}

export interface StoryPhase {
  id: string
  title: string
  description: string
}

export interface StoryEnding {
  id: string
  title: string
  description: string
}

// ===== Player Attributes =====

export interface PlayerAttributes {
  name: string
  gender: string
  age: number
  height: number      // cm
  weight: number      // kg
  appearance: number  // 1-10
  iq: number          // 1-10
  eq: number          // 1-10
  charm: number       // 1-10
  eloquence: number   // 1-10
  economics: number   // 1-10
  luck: number        // 1-10
  personality: string[]
}

export const PERSONALITY_OPTIONS = [
  '内向', '外向', '冷静', '热情', '理性', '感性',
  '善良', '狡猾', '勇敢', '谨慎', '幽默', '严肃',
  '正直', '圆滑', '独立', '依赖', '乐观', '悲观',
  '宽容', '固执', '浪漫', '务实'
]

export const DEFAULT_ATTRIBUTES: PlayerAttributes = {
  name: '新来的教师',
  gender: '男',
  age: 25,
  height: 175,
  weight: 70,
  appearance: 5,
  iq: 5,
  eq: 5,
  charm: 5,
  eloquence: 5,
  economics: 5,
  luck: 5,
  personality: ['理性', '善良'],
}

// ===== Auth =====

export interface User {
  id: number
  username: string
}

export interface AuthState {
  token: string | null
  user: User | null
}

// ===== Game State =====

export interface GameState {
  // Auth
  token: string | null
  user: User | null

  // Navigation
  view: 'categories' | 'storyList' | 'storyDetail' | 'characterCreate' | 'game'
  selectedCategory: string | null
  selectedStoryId: string | null

  // Game session
  sessionId: string | null
  storyId: string | null
  currentNPC: string | null
  playerAttributes: PlayerAttributes
  messages: Message[]
  choices: string[]
  isLoading: boolean
  emotion: string
  phase: string
  currentPhaseIndex: number

  // Story detail
  storyDetail: StoryDetail | null
}

export interface Message {
  id: string
  speaker: 'narrator' | 'player' | 'npc'
  npcId?: string
  npcName?: string
  content: string
  emotion?: string
  timestamp: number
}

export interface ChatResponse {
  reply: string
  mood: string
  sceneUpdate: string
  hint: string
  choices?: string[]
}
