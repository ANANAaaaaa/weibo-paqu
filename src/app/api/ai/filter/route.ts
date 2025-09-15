import { NextRequest, NextResponse } from 'next/server'
import { QwenClient } from '@/lib/ai/clients'
import { AI_PROMPTS } from '@/lib/ai/prompts'
import { AIFilterResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { items, category } = await request.json()
    
    if (!items || !category) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const qwenClient = new QwenClient()
    
    // 构建提示词
    const systemPrompt = AI_PROMPTS.rssFilter.replace('{{CATEGORY}}', category)
    
    // 构建输入数据
    const inputData = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary || ''
    }))

    const userPrompt = `请筛选以下内容中属于「${category}」的项目：\n\n${JSON.stringify(inputData, null, 2)}\n\n请返回JSON格式：{"filteredIds": ["id1", "id2"], "reasonById": {"id1": "理由1", "id2": "理由2"}}`

    const response = await qwenClient.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    // 解析AI响应
    let result: AIFilterResult
    try {
      result = JSON.parse(response)
    } catch (parseError) {
      // 如果解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI响应格式错误')
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI筛选失败:', error)
    return NextResponse.json(
      { error: 'AI筛选失败' },
      { status: 500 }
    )
  }
}