import { NextRequest, NextResponse } from 'next/server'
import { RSSService } from '@/lib/data/rss'
import { TianjuService } from '@/lib/data/tianju'
import { BangyanService } from '@/lib/data/bangyan'
import { HotItem } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'all'
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'time'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '60')

    let items: HotItem[] = []

    // 根据来源获取数据
    const sources = source.includes(',') ? source.split(',') : [source]
    
    if (sources.includes('all') || sources.includes('rss')) {
      const forceRefresh = searchParams.get('forceRefresh') === 'true'
      const rssService = new RSSService()
      const rssItems = await rssService.fetchAllRSSFeeds(forceRefresh)
      items.push(...rssItems)
    }

    // 天聚：新增 topnews 与 huabian
    if (sources.includes('tianju_topnews')) {
      const tianjuService = new TianjuService()
      const list = await tianjuService.fetchTopnews(20)
      items.push(...list)
    } else if (sources.includes('tianju_huabian')) {
      const tianjuService = new TianjuService()
      const list = await tianjuService.fetchHuabian(20)
      items.push(...list)
    } else if (sources.includes('all') || sources.includes('tianju')) {
      // 兼容旧用法：拉取默认的电竞+动漫
      const tianjuService = new TianjuService()
      const tianjuItems = await tianjuService.fetchAll()
      items.push(...tianjuItems)
    }

    if (sources.includes('bangyan') || sources.some(s => ['bangyan_weibo','bangyan_douyin','bangyan_zhihu'].includes(s))) {
      const bangyanService = new BangyanService()
      // 如果指定子平台，则仅返回该平台；否则返回合并（微博→抖音→知乎）
      if (sources.includes('bangyan_weibo') || sources.includes('bangyan_douyin') || sources.includes('bangyan_zhihu')) {
        const all = await bangyanService.fetchAll()
        const mapName: Record<string,string> = {
          bangyan_weibo: '微博',
          bangyan_douyin: '抖音',
          bangyan_zhihu: '知乎'
        }
        const allow = Object.keys(mapName).filter(k => sources.includes(k)).map(k => mapName[k])
        items.push(...all.filter(it => allow.some(n => (it.sourceName || '').startsWith(n))))
      } else {
        const bangyanItems = await bangyanService.fetchAll()
        items.push(...bangyanItems)
      }
    }

    // 搜索过滤
    if (search) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.summary && item.summary.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // 排序
    if (sortBy === 'time') {
      items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    } else if (sortBy === 'hot') {
      items.sort((a, b) => (b.score || 0) - (a.score || 0))
    }

    // 分页
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = items.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedItems,
      total: items.length,
      page,
      pageSize,
      hasMore: endIndex < items.length
    })
  } catch (error) {
    console.error('获取热点数据失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}