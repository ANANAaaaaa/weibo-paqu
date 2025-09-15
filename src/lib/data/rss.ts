import { RSSItem } from '@/types'
import { RSSProxyService } from './rss-proxy'

// RSS服务 - 简化版，直接使用代理服务
export class RSSService {
  private proxyService = new RSSProxyService()

  async fetchAllRSSFeeds(forceRefresh: boolean = false): Promise<RSSItem[]> {
    console.log(`开始获取RSS数据${forceRefresh ? ' (强制刷新)' : ''}...`)
    
    try {
      const items = await this.proxyService.fetchAllFeeds(forceRefresh)
      console.log(`RSS获取完成: ${items.length} 条数据`)
      return items
    } catch (error) {
      console.error('RSS获取失败:', error)
      return []
    }
  }

  // 清除缓存
  clearCache(): void {
    this.proxyService.clearCache()
  }

  // 获取缓存状态
  getCacheStatus() {
    return this.proxyService.getCacheInfo()
  }
}

// 导出便捷函数
export async function fetchRSSItems(forceRefresh: boolean = false): Promise<RSSItem[]> {
  const rssService = new RSSService()
  return await rssService.fetchAllRSSFeeds(forceRefresh)
}