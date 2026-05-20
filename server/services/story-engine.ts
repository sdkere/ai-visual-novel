import { generateChatResponse, type ChatMessage } from './ai.js'
import fs from 'fs'
import path from 'path'

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
  attributes: Record<string, any>
  inventory: string[]
  relationships: Record<string, number>
}

export interface HistoryEntry {
  speaker: string
  content: string
  timestamp: number
  npcId?: string
}

// Load story data from JSON files
function loadStoryData(storyId: string): any | null {
  const storyPath = path.join(process.cwd(), 'data', 'stories', `${storyId}.json`)
  if (!fs.existsSync(storyPath)) return null
  return JSON.parse(fs.readFileSync(storyPath, 'utf-8'))
}

// Build NPC-specific system prompt
function buildNPCPrompt(story: any, npcId: string, context: StoryContext): string {
  const npc = story.npcs?.find((n: any) => n.id === npcId)
  if (!npc) return buildNarratorPrompt(story, context)

  const attrs = context.playerState.attributes || {}
  const attrDesc: string[] = []
  if (attrs.name) attrDesc.push(`姓名：${attrs.name}`)
  if (attrs.gender) attrDesc.push(`性别：${attrs.gender}`)
  if (attrs.age) attrDesc.push(`年龄：${attrs.age}`)
  if (attrs.appearance) attrDesc.push(`外貌：${attrs.appearance}/10`)
  if (attrs.iq) attrDesc.push(`智商：${attrs.iq}/10`)
  if (attrs.eq) attrDesc.push(`情商：${attrs.eq}/10`)
  if (attrs.charm) attrDesc.push(`魅力：${attrs.charm}/10`)
  if (attrs.eloquence) attrDesc.push(`口才：${attrs.eloquence}/10`)
  if (attrs.economics) attrDesc.push(`经济状况：${attrs.economics}/10`)
  if (attrs.personality?.length) attrDesc.push(`性格：${attrs.personality.join('、')}`)

  // Calculate NPC attitude
  const charm = attrs.charm || 5
  const eq = attrs.eq || 5
  const eloquence = attrs.eloquence || 5
  const avg = (charm + eq + eloquence) / 3
  let attitude = '中立客气'
  if (avg >= 8) attitude = '非常友好，愿意敞开心扉'
  else if (avg >= 6) attitude = '友好，愿意交谈'
  else if (avg >= 4) attitude = '中立，保持距离'
  else attitude = '警惕冷淡，不愿多说'

  const phase = story.phases?.find((p: any) => p.id === context.sceneId) || story.phases?.[0]

  return `【核心规则 - 最高优先级】
你是${npc.name}。玩家刚才对你说了话或做了某件事，你必须直接回应玩家的输入。禁止复述背景故事，禁止忽略玩家的话。你的每一句话都要体现你在回应玩家。

【你的身份】
${npc.name}，${npc.age}岁，${npc.role}。
性格：${npc.personality}
说话风格：${npc.speechStyle}
人物关系：${npc.relationships}

【故事背景（仅供参考，不要复述）】
${story.title} - ${story.background.substring(0, 100)}...
当前阶段：${phase ? phase.title : '故事进行中'}

【玩家信息】
${attrs.name || '李明'}是这个故事的主角，不是旁观者。${story.playerRole || ''}
属性：${attrDesc.join('；') || '普通'}
你对玩家的态度：${attitude}

【回复要求】
- 把玩家当作故事中的重要角色来对待，而不是局外人
- 直接回应玩家刚才说的话/做的事
- 用${npc.name}的性格和语气说话
- 120-200字
- 结尾必须给出2-3个选择项

【输出格式】
（动作描写）"对话内容。"
选择1: xxx
选择2: xxx
选择3: xxx`
}

function buildNarratorPrompt(story: any, context: StoryContext): string {
  const attrs = context.playerState.attributes || {}
  const phase = story.phases?.find((p: any) => p.id === context.sceneId) || story.phases?.[0]

  return `【核心规则 - 最高优先级】
你是「${story.title}」的叙事者。玩家刚才做了某个行动或说了某句话，你必须从玩家的行动开始叙述，描写这个行动带来的后果和场景变化。禁止忽略玩家的输入。

【故事背景（仅供参考）】
${story.background.substring(0, 150)}...
当前阶段：${phase ? phase.title : '故事进行中'}

【玩家角色 - 故事主角】
${attrs.name || '李明'}，${story.playerRole || '故事的主角'}。你不是旁白的旁观者，而是围绕${attrs.name || '李明'}展开的故事。所有叙事都要以${attrs.name || '李明'}为中心。

【回复要求】
- 从玩家刚才的行动开始叙述
- 描写场景变化和NPC反应
- 150-250字
- 文笔优美，有氛围感
- 结尾必须给出2-3个选择项

【输出格式】
叙事内容。
选择1: xxx
选择2: xxx
选择3: xxx`
}

export async function generateStoryResponse(
  context: StoryContext,
  playerInput: string,
  npcId: string
): Promise<{ content: string; emotion: string; choices: string[] }> {
  const story = loadStoryData(context.worldId)

  // Build system prompt
  let systemPrompt: string
  if (story && npcId && npcId !== '_narrator') {
    systemPrompt = buildNPCPrompt(story, npcId, context)
  } else if (story) {
    systemPrompt = buildNarratorPrompt(story, context)
  } else {
    // Fallback for unknown stories
    systemPrompt = '你是一个互动小说游戏的叙事者。根据玩家的输入推进故事，每次回复150-200字，末尾提供2-3个选择。'
  }

  // Build messages array
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...context.history.slice(-15).map((h) => ({
      role: (h.speaker === 'player' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.speaker === 'player'
        ? h.content
        : `[${h.npcId === '_narrator' ? '旁白' : (story?.npcs?.find((n: any) => n.id === h.npcId)?.name || '角色')}] ${h.content}`,
    })),
    { role: 'user', content: `玩家刚才说了/做了：${playerInput}\n\n请基于玩家的这句话/这个行动做出回应，不要忽略玩家的输入。` },
  ]

  const response = await generateChatResponse(messages, { temperature: 0.75 })

  // Parse choices from the response
  const { cleanedContent, choices } = parseChoices(response.content)

  // Always provide choices - use parsed ones or generate defaults
  let finalChoices = choices.length > 0 ? choices : response.choices || []
  if (finalChoices.length === 0) {
    finalChoices = generateDefaultChoices(npcId, context.sceneId)
  }

  return {
    content: cleanedContent,
    emotion: response.emotion || 'neutral',
    choices: finalChoices,
  }
}

function parseChoices(content: string): { cleanedContent: string; choices: string[] } {
  const choices: string[] = []
  const lines = content.split('\n')
  const contentLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { contentLines.push(line); continue }

    // Match various choice patterns
    const choiceMatch =
      trimmed.match(/^(?:选择|选项|行动|你可以)[\s]*[1-9][.、:：\)）]\s*(.+)/) ||
      trimmed.match(/^[1-9][.、:）\)]\s*(.+)/) ||
      trimmed.match(/^[-•·]\s*(.+)/)

    if (choiceMatch) {
      let text = choiceMatch[1].trim()
      text = text.replace(/^\*+|\*+$/g, '').trim()
      text = text.replace(/\*+/g, '').trim()
      if (text) choices.push(text)
    } else {
      contentLines.push(line)
    }
  }

  return {
    cleanedContent: cleanMarkdown(contentLines.join('\n').trim()),
    choices: choices.slice(0, 4),
  }
}

function cleanMarkdown(text: string): string {
  return text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
}

function generateDefaultChoices(npcId: string, phase: string): string[] {
  if (npcId === '_narrator' || !npcId) {
    return [
      '仔细观察周围的情况',
      '向前走去，探索更多',
      '找人聊聊，了解情况',
    ]
  }

  // NPC-specific default actions
  const npcActions: Record<string, string[]> = {
    zhou_puyuan: ['询问学校管理方面的事', '试探性地提起旧事', '告辞离开'],
    fanyi: ['关心地询问她的近况', '试探她与周言舟的关系', '倾听她的倾诉'],
    shiping: ['温和地与她攀谈', '询问她在这里工作多久了', '观察她的反应'],
    zhou_ping: ['询问他的研究进展', '试探他对家庭的看法', '聊聊他的近况'],
    lu_dahai: ['了解学生维权的情况', '询问他对校长的看法', '支持他的正义行动'],
    zhou_chong: ['询问他的学习和生活', '了解他对四凤的感情', '鼓励他追求理想'],
    lu_sifeng: ['关心她的工作和生活', '试探她与周言舟的关系', '温和地开导她'],
    lu_gui: ['套他的话，了解周家秘密', '给他点好处换取信息', '不理会他的暗示'],
  }

  return npcActions[npcId] || ['继续对话', '换个话题', '告辞离开']
}
