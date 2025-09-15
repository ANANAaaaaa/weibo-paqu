import { NextResponse } from 'next/server'
import { RSSService } from '@/lib/data/rss'
import { TianjuService } from '@/lib/data/tianju'
import { BangyanService } from '@/lib/data/bangyan'

export async function GET() {
  try {
    console.log('开始测试数据源...')
    
    // 测试天聚数据
    console.log('=== 测试天聚数据 ===')
    const tianjuService = new TianjuService()
    const tianjuItems = await tianjuService.fetchAll()
    console.log(`天聚数据获取完成: ${tianjuItems.length} 条`)

    // 测试榜眼数据
    console.log('=== 测试榜眼数据 ===')
    const bangyanService = new BangyanService()
    const bangyanItems = await bangyanService.fetchAll()
    console.log(`榜眼数据获取完成: ${bangyanItems.length} 条`)

    // 测试RSS数据 (只测试前3个源)
    console.log('=== 测试RSS数据 ===')
    const rssService = new RSSService()
    // 临时只测试一个RSS源
    const testRssItems = await rssService.fetchAllRSSFeeds(false)
    console.log(`RSS测试完成: ${testRssItems.length} 条`)

    const result = {
      success: true,
      data: {
        tianju: {
          count: tianjuItems.length,
          sample: tianjuItems.slice(0, 2)
        },
        bangyan: {
          count: bangyanItems.length,
          sample: bangyanItems.slice(0, 2)
        },
        rss: {
          count: testRssItems.length,
          sample: testRssItems.slice(0, 2)
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('数据源测试失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}