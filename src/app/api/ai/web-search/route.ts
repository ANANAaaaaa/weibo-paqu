import { NextRequest, NextResponse } from 'next/server'
import { BochaClient } from '@/lib/ai/clients'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      )
    }

    const bochaClient = new BochaClient()
    const searchResults = await bochaClient.webSearch(query, {
      summary: true,
      count: 10
    })

    return NextResponse.json({
      success: true,
      query,
      results: searchResults.results || [],
      summary: searchResults.summary || '未找到相关信息'
    })

  } catch (error) {
    console.error('博查搜索API错误:', error)
    return NextResponse.json(
      { error: '搜索服务暂时不可用' },
      { status: 500 }
    )
  }
}