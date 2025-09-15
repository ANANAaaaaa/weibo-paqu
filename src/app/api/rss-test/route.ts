import { NextResponse } from 'next/server'
import { RSSService } from '@/lib/data/rss'
import { RSSProxyService } from '@/lib/data/rss-proxy'

export async function GET() {
  try {
    console.log('开始测试RSS服务...')
    
    // 测试代理服务
    console.log('=== 测试RSS代理服务 ===')
    const proxyService = new RSSProxyService()
    const proxyItems = await proxyService.fetchAllFeeds()
    
    // 测试完整RSS服务
    console.log('=== 测试完整RSS服务 ===')
    const rssService = new RSSService()
    const rssItems = await rssService.fetchAllRSSFeeds()

    const result = {
      success: true,
      data: {
        proxy: {
          count: proxyItems.length,
          sample: proxyItems.slice(0, 3),
          cacheInfo: proxyService.getCacheInfo()
        },
        rss: {
          count: rssItems.length,
          sample: rssItems.slice(0, 3),
          cacheInfo: rssService.getCacheStatus()
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('RSS测试失败:', error)
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