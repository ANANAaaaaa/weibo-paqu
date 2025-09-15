import { NextRequest, NextResponse } from 'next/server'
import { QwenClient } from '@/lib/ai/clients'
import { Topic } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { hotItems, excludeIds = [] } = await request.json()
    
    if (!hotItems || hotItems.length === 0) {
      return NextResponse.json(
        { error: '缺少热点数据' },
        { status: 400 }
      )
    }

    const qwenClient = new QwenClient()
    
    // 构建热点数据摘要
    const hotItemsSummary = hotItems
      .filter((item: any) => !excludeIds.includes(item.id))
      .slice(0, 10)
      .map((item: any) => `- ${item.title} (${item.sourceName})`)
      .join('\n')

    const systemPrompt = `你是短视频选题生成器。基于当日热点，生成5个不同角度的短视频选题。

要求：
1. 每个选题要有明确的标题和切入角度
2. 选题要适合短视频形式，有话题性和传播性
3. 避免重复角度，确保叙事框架差异
4. 关联相关的热点条目ID

输出JSON格式：
{
  "topics": [
    {
      "title": "选题标题",
      "angle": "切入角度描述",
      "refs": ["相关热点ID1", "相关热点ID2"]
    }
  ]
}`

    const userPrompt = `基于以下热点数据生成5个选题：\n\n${hotItemsSummary}\n\n热点数据详情：\n${JSON.stringify(hotItems.slice(0, 10), null, 2)}`

    const response = await qwenClient.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    // 解析AI响应
    let result: { topics: Topic[] }
    try {
      result = JSON.parse(response)
    } catch (parseError) {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI响应格式错误')
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('选题生成失败:', error)
    return NextResponse.json(
      { error: '选题生成失败' },
      { status: 500 }
    )
  }
}