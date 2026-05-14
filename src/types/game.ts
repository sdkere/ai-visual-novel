export interface World {
  id: string
  title: string
  description: string
  cover: string
  characters: string[]
  tags: string[]
  estimatedPlayTime: string
}

export interface GameState {
  sessionId: string | null
  worldId: string | null
  sceneId: string
  messages: Message[]
  choices: string[]
  isLoading: boolean
  emotion: string
  playerName: string
}

export interface Message {
  id: string
  speaker: 'narrator' | 'player' | 'character'
  characterName?: string
  content: string
  emotion?: string
  timestamp: number
}

export interface ChatResponse {
  content: string
  emotion: string
  choices: string[]
  sceneId: string
  historyLength: number
}
