import { generateChatResponse, type ChatMessage } from './ai.js'

export interface StoryContext {
  worldId: string
  sceneId: string
  characters: Character[]
  playerState: PlayerState
  history: HistoryEntry[]
}

export interface Character {
  id: string
  name: string
  personality: string
  avatar: string
  emotion: string
}

export interface PlayerState {
  name: string
  attributes: Record<string, number>
  inventory: string[]
  relationships: Record<string, number>
}

export interface HistoryEntry {
  speaker: string
  content: string
  timestamp: number
}

// World definitions with rich system prompts
const WORLD_PROMPTS: Record<string, string> = {
  'enchanted-forest': `你是一个名为"幻境·迷雾森林"的视觉小说游戏的叙事引擎。

【世界观】
在一片被永恒迷雾笼罩的古老森林中，隐藏着一个鲜为人知的精灵王国。千年来，森林的守护结界保护着这里的和平。但最近，结界开始出现裂痕，黑暗生物开始渗透进来。

【核心角色】
1. 艾拉 (Aira) - 森林守护者，银发绿瞳的精灵少女，温柔但内心坚强，对森林有着深厚的使命感。
2. 凯尔 (Kael) - 流浪的暗影猎人，曾是王国骑士团成员，因一次任务失败而离开，带着神秘的过去。
3. 露娜 (Luna) - 神秘的占星师，似乎知道很多关于结界裂痕的秘密，总是说出意味深长的话。

【叙事规则】
1. 以第三人称叙事，包含环境描写和角色内心独白
2. 每次回复必须包含：
   - "content": 叙事内容（200-400字，包含对话和描写）
   - "emotion": 当前场景的情感基调（mysterious/warm/tense/sad/hopeful/dark）
   - "choices": 2-3个玩家可以选择的行动
3. 保持剧情连贯性，根据玩家选择推进故事
4. 适当制造悬念和转折，让玩家有探索欲望
5. 角色对话要符合各自性格

【当前状态】
请根据以下信息生成下一段剧情：

{context}`,
}

export async function generateStoryResponse(
  context: StoryContext,
  playerInput: string
): Promise<{ content: string; emotion: string; choices: string[] }> {
  const worldPrompt = WORLD_PROMPTS[context.worldId]
  if (!worldPrompt) {
    throw new Error(`Unknown world: ${context.worldId}`)
  }

  // Build context string
  const contextStr = buildContextString(context, playerInput)

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: worldPrompt.replace('{context}', contextStr),
    },
    ...context.history.slice(-10).map((h) => ({
      role: h.speaker === 'player' ? ('user' as const) : ('assistant' as const),
      content: `${h.speaker}: ${h.content}`,
    })),
    {
      role: 'user',
      content: `玩家选择: ${playerInput}`,
    },
  ]

  return generateChatResponse(messages, { temperature: 0.85 })
}

function buildContextString(context: StoryContext, playerInput: string): string {
  const parts = [
    `当前场景: ${context.sceneId}`,
    `玩家状态: ${JSON.stringify(context.playerState)}`,
    `在场角色: ${context.characters.map((c) => `${c.name}(${c.emotion})`).join(', ')}`,
    `玩家行动: ${playerInput}`,
  ]

  if (context.history.length > 0) {
    const recentHistory = context.history
      .slice(-5)
      .map((h) => `[${h.speaker}]: ${h.content}`)
      .join('\n')
    parts.push(`最近对话:\n${recentHistory}`)
  }

  return parts.join('\n')
}
