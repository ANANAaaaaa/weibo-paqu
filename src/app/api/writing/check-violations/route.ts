import { NextRequest, NextResponse } from 'next/server'
import { QwenClient } from '@/lib/ai/clients'
import { ViolationCheck } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: '缺少文案内容' },
        { status: 400 }
      )
    }

    const qwenClient = new QwenClient()
    
    const systemPrompt = `你是违禁词检测专家。分析文案内容，识别可能的合规风险并提供替换建议。

检测类别：
- 合规：违反平台规定的词汇
- 引战：可能引起争议或对立的表述
- 夸大：过度夸张或绝对化的表述
- 低俗：不雅或低俗的内容
- 其他：其他潜在风险

输出JSON格式：
{
  "highlights": [
    {
      "text": "问题文本",
      "start": 起始位置,
      "end": 结束位置,
      "risk": "风险类型"
    }
  ],
  "suggestions": [
    {
      "target": "原文本",
      "candidates": ["替换选项1", "替换选项2"],
      "note": "替换原因"
    }
  ]
}`

    const userPrompt = `请检测以下文案的违禁词和风险点：\n\n${content}`

    const response = await qwenClient.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    // 解析AI响应
    let result: ViolationCheck
    try {
      result = JSON.parse(response)
    } catch (parseError) {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        // 如果解析失败，返回空结果
        result = {
          highlights: [],
          suggestions: []
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('违禁词检测失败:', error)
    return NextResponse.json(
      { error: '违禁词检测失败' },
      { status: 500 }
    )
  }
}