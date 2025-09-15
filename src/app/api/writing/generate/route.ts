import { NextRequest, NextResponse } from 'next/server'
import { DeepSeekClient, BochaClient } from '@/lib/ai/clients'
import { AI_PROMPTS } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { topic, style, hotItems = [] } = await request.json()
    
    if (!topic || !style) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 1. 关键词提取 (简单实现)
    const keywords = (topic.title + ' ' + topic.angle)
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(word => word.length > 1)
      .slice(0, 5)
      .join(' ')

    // 2. 博查搜索
    const bochaClient = new BochaClient()
    let searchSummary = ''
    try {
      const searchResult = await bochaClient.webSearch(keywords)
      searchSummary = searchResult.summary || '暂无相关搜索结果'
    } catch (error) {
      console.error('博查搜索失败:', error)
      searchSummary = '搜索服务暂时不可用'
    }

    // 3. 构建相关热点信息
    const relatedHotItems = hotItems
      .filter((item: any) => topic.refs.includes(item.id))
      .map((item: any) => `- ${item.title}: ${item.summary || ''}`)
      .join('\n')

    // 4. 获取风格提示词
    let stylePrompt = ''
    if (style in AI_PROMPTS.styles) {
      stylePrompt = AI_PROMPTS.styles[style as keyof typeof AI_PROMPTS.styles]
    } else {
      stylePrompt = `请以${style}的风格创作短视频文案，字数控制在400字左右。`
    }

    // 5. 生成文案
    const deepSeekClient = new DeepSeekClient()
    
    const userPrompt = `选题信息：
标题：${topic.title}
角度：${topic.angle}

相关热点：
${relatedHotItems}

背景搜索摘要：
${searchSummary}

请基于以上信息，创作一段400字左右的短视频口播文案。`

    const response = await deepSeekClient.chat([
      { role: 'system', content: stylePrompt },
      { role: 'user', content: userPrompt }
    ])

    // 生成草稿ID
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const draft = {
      id: draftId,
      topicId: topic.id || `topic_${Date.now()}`,
      content: response,
      style,
      createdAt: new Date().toISOString(),
      finalized: false,
      versions: {
        items: [{
          content: response,
          createdAt: new Date().toISOString()
        }]
      }
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('文案生成失败:', error)
    return NextResponse.json(
      { error: '文案生成失败' },
      { status: 500 }
    )
  }
}