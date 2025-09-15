import axios from 'axios'
import { RSSItem } from '@/types'

// RSS代理服务 - 使用新的可用RSSHub实例
export class RSSProxyService {
  private cache = new Map<string, { data: RSSItem[], timestamp: number }>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30分钟缓存，避免频繁请求
  private readonly REQUEST_DELAY = 1000 // 1秒延迟
  private readonly RSS_BASE_URL = 'https://rsshub-production-e0d5.up.railway.app/weibo/user'

// 微博用户ID到用户名的映射
  private readonly USER_MAPPING: Record<string, string> = {
    '5400431801': '牯岭街少女',
    '1072962941': '热播电视剧',
    '7391324928': '看韩影',
    '6871390978': '快乐追星十级学渣',
    '6890070834': '非职业熬夜冠军',
    '6330503671': '复读机卡机了',
    '6423651199': '小狗斯特',
    '6559402245': '烫金真爱册',
    '6618806075': '插花大师',
    '5666481284': '心动收藏站',
    '2120754067': '朝阳区在逃富婆',
    '3051218441': 'Sweet猫饼',
    '5607032695': '钮祜禄流流',
    '2456865965': '芝麻糊了吧',
    '5273937341': '泡菜那些事'
  }

  async fetchUserFeed(uid: string, userName: string): Promise<RSSItem[]> {
    const cacheKey = `rss_${uid}`
    const cached = this.cache.get(cacheKey)
    
    // 检查缓存
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`${userName}(${uid}) 使用缓存数据`)
      return cached.data
    }

    try {
      const url = `${this.RSS_BASE_URL}/${uid}`
      console.log(`正在获取 ${userName}(${uid}) 的RSS数据: ${url}`)
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 15000,
        validateStatus: (status) => status < 500
      })

      if (response.status === 200 && response.data) {
        const items = await this.parseRSSContent(response.data, uid, userName)
        
        // 缓存数据
        this.cache.set(cacheKey, { data: items, timestamp: Date.now() })
        
        return items
      } else {
        console.warn(`${userName}(${uid}) 返回状态码: ${response.status}`)
        return []
      }
    } catch (error: any) {
      const errorMsg = error?.response?.status 
        ? `HTTP ${error.response.status}` 
        : error?.code || error?.message || '未知错误'
      console.error(`${userName}(${uid}) 获取失败: ${errorMsg}`)
      return []
    }
  }

  private async parseRSSContent(xmlData: string, uid: string, userName: string): Promise<RSSItem[]> {
    try {
      const items: RSSItem[] = []
      
      // 使用正则表达式提取RSS项目
      const itemRegex = /<item>[\s\S]*?<\/item>/g
      const matches = xmlData.match(itemRegex) || []

      for (let i = 0; i < matches.length; i++) {
        const itemXml = matches[i]
        
        // 提取标题 - 支持CDATA和普通格式
        let title = ''
        const titleCdataMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
        const titleMatch = itemXml.match(/<title>(.*?)<\/title>/)
        
        if (titleCdataMatch) {
          title = titleCdataMatch[1]
        } else if (titleMatch) {
          title = titleMatch[1]
        }

        // 提取链接
        let link = ''
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/)
        if (linkMatch) {
          link = linkMatch[1]
        }

        // 提取发布时间
        let pubDate = new Date().toISOString()
        const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)
        if (pubDateMatch) {
          pubDate = pubDateMatch[1]
        }

        if (title && link) {
          items.push({
            id: `rss_${uid}_${i}_${Date.now()}`,
            title: title.trim(),
            summary: title.trim(), // 简化：summary就是title
            description: title.trim(),
            link: link.trim(),
            pubDate: pubDate,
            platform: 'rss',
            sourceName: userName
          })
        }
      }

      console.log(`${userName}(${uid}) 解析到 ${items.length} 条数据`)
      return items
    } catch (error) {
      console.error(`${userName}(${uid}) RSS解析失败:`, error)
      return []
    }
  }

  async fetchAllFeeds(forceRefresh: boolean = false): Promise<RSSItem[]> {
    const userIds = Object.keys(this.USER_MAPPING)
    console.log(`开始获取 ${userIds.length} 个用户的微博RSS数据${forceRefresh ? ' (强制刷新)' : ''}...`)
    
    // 如果强制刷新，清除所有缓存
    if (forceRefresh) {
      this.clearCache()
    }
    
    const allItems: RSSItem[] = []
    let successCount = 0

    // 串行处理避免被限流
    for (let i = 0; i < userIds.length; i++) {
      const uid = userIds[i]
      const userName = this.USER_MAPPING[uid]
      
      try {
        const items = await this.fetchUserFeed(uid, userName)
        if (items.length > 0) {
          allItems.push(...items)
          successCount++
        }
      } catch (error) {
        console.error(`${userName}(${uid}) 处理失败:`, error)
      }

      // 请求间隔，避免被限流
      if (i < userIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY))
      }
    }

    console.log(`RSS获取完成: ${allItems.length} 条数据，成功 ${successCount}/${userIds.length} 个源`)

    // 按时间倒序排序
    return allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear()
    console.log('RSS缓存已清除')
  }

  // 获取缓存状态
  getCacheInfo(): { totalCached: number, cacheKeys: string[] } {
    return {
      totalCached: this.cache.size,
      cacheKeys: Array.from(this.cache.keys())
    }
  }
}