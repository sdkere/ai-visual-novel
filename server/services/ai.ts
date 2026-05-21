import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: process.env.AI_API_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.AI_API_KEY || 'dummy-key',
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
  emotion?: string
  choices?: string[]
}

export async function generateChatResponse(
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<ChatResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages,
      temperature: options?.temperature ?? 0.8,
      max_tokens: options?.maxTokens ?? 1500,
    })

    const content = response.choices[0]?.message?.content || ''
    const finishReason = response.choices[0]?.finish_reason

    // If truncated, log a warning
    if (finishReason === 'length') {
      console.warn('AI response was truncated (max_tokens reached)')
    }

    // Try to parse as JSON first (in case model returns structured output)
    try {
      const parsed = JSON.parse(content)
      return {
        content: parsed.content || parsed.dialogue || parsed.text || content,
        emotion: parsed.emotion || parsed.mood || 'neutral',
        choices: parsed.choices || [],
      }
    } catch {
      // Not JSON, return as plain text
      return {
        content: content,
        emotion: 'neutral',
        choices: [],
      }
    }
  } catch (error: any) {
    console.error('AI API Error:', error.message)
    return {
      content: '（系统提示：AI 服务暂时不可用，请稍后再试）',
      emotion: 'neutral',
      choices: ['继续探索', '返回主菜单'],
    }
  }
}

/**
 * 根据最新剧情生成3个能推动剧情发展的选项
 */
export async function generatePlotChoices(
  storyTitle: string,
  currentPhase: string,
  latestNarrative: string,
  npcName?: string
): Promise<string[]> {
  try {
    const npcContext = npcName ? `玩家正在与${npcName}对话。` : '这是旁白叙事。'
    const prompt = `你是「${storyTitle}」的剧情助手。${npcContext}

当前剧情阶段：${currentPhase}

最新一段叙事：
${latestNarrative.slice(-500)}

请生成3个选项，每个选项必须：
1. 与当前剧情紧密相关
2. 能推动故事向前发展
3. 体现不同的行动方向（如对话、行动、思考等）
4. 简洁有力，15字以内

只输出3个选项，每行一个，不要编号，不要其他文字。`

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 150,
    })

    const content = response.choices[0]?.message?.content || ''
    const choices = content.split('\n').map(c => c.trim()).filter(c => c.length > 0 && c.length < 50)

    return choices.slice(0, 3)
  } catch {
    return []
  }
}
