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
