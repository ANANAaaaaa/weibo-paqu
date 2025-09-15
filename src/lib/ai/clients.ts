import axios from 'axios'

// 通义千问客户端
export class QwenClient {
  private apiKey: string
  private baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || ''
  }

  async chat(messages: Array<{role: string, content: string}>, model = 'qwen-flash') {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Qwen API 调用失败:', error)
      throw error
    }
  }
}

// DeepSeek客户端
export class DeepSeekClient {
  private apiKey: string
  private baseURL = 'https://api.deepseek.com'

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''
  }

  async chat(messages: Array<{role: string, content: string}>) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data.choices[0].message.content
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error)
      throw error
    }
  }
}

// 博查搜索客户端
export class BochaClient {
  private apiKey: string
  private baseURL = 'https://api.bochaai.com/v1'

  constructor() {
    this.apiKey = process.env.BOCHA_API_KEY || ''
  }

  async webSearch(query: string, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/web-search`,
        {
          query,
          summary: true,
          count: 10,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('博查搜索 API 调用失败:', error)
      throw error
    }
  }
}