import axios from 'axios'
import { HotItem } from '@/types'

export class TianjuService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.TIANAPI_KEY || ''
  }

  private mapList(list: any[], sourceName: string, prefix: string): HotItem[] {
    return (list || []).map((item: any, index: number) => ({
      id: `${prefix}_${Date.now()}_${index}`,
      title: item.title,
      summary: item.digest || item.intro || item.description || '',
      link: item.url || item.sourceUrl || '',
      pubDate: item.ctime || item.publishTime || new Date().toISOString(),
      platform: 'tianju',
      sourceName
    }))
  }

  async fetchTopnews(num: number = 20): Promise<HotItem[]> {
    try {
      const url = `https://apis.tianapi.com/topnews/index?key=${this.apiKey}&num=${num}`
      const res = await axios.get(url, { timeout: 15000 })
      if (res.data?.code === 200) {
        const list = res.data?.result?.newslist || []
        return this.mapList(list, '天聚·要闻', 'tianju_topnews')
      }
      return []
    } catch (e) {
      console.error('天聚要闻获取失败:', e)
      return []
    }
  }

  async fetchHuabian(num: number = 20): Promise<HotItem[]> {
    try {
      const url = `https://apis.tianapi.com/huabian/index?key=${this.apiKey}&num=${num}`
      const res = await axios.get(url, { timeout: 15000 })
      if (res.data?.code === 200) {
        const list = res.data?.result?.newslist || []
        return this.mapList(list, '天聚·花边', 'tianju_huabian')
      }
      return []
    } catch (e) {
      console.error('天聚花边获取失败:', e)
      return []
    }
  }

  // 旧的保留，避免影响其他测试路由
  async fetchEsports(): Promise<HotItem[]> {
    try {
      const response = await axios.get(
        `https://apis.tianapi.com/esports/index?key=${this.apiKey}&num=10`
      )

      if (response.data.code === 200) {
        return response.data.result.newslist.map((item: any, index: number) => ({
          id: `tianju_esports_${Date.now()}_${index}`,
          title: item.title,
          summary: item.digest || item.content?.substring(0, 200),
          link: item.url,
          pubDate: item.ctime || new Date().toISOString(),
          platform: 'tianju',
          sourceName: '天聚·电竞'
        }))
      }
      return []
    } catch (error) {
      console.error('天聚电竞数据获取失败:', error)
      return []
    }
  }

  async fetchAnime(): Promise<HotItem[]> {
    try {
      const response = await axios.get(
        `https://apis.tianapi.com/dongman/index?key=${this.apiKey}&num=10`
      )

      if (response.data.code === 200) {
        return response.data.result.newslist.map((item: any, index: number) => ({
          id: `tianju_anime_${Date.now()}_${index}`,
          title: item.title,
          summary: item.digest || item.content?.substring(0, 200),
          link: item.url,
          pubDate: item.ctime || new Date().toISOString(),
          platform: 'tianju',
          sourceName: '天聚·动漫'
        }))
      }
      return []
    } catch (error) {
      console.error('天聚动漫数据获取失败:', error)
      return []
    }
  }

  async fetchAll(): Promise<HotItem[]> {
    const [esports, anime] = await Promise.all([
      this.fetchEsports(),
      this.fetchAnime()
    ])
    return [...esports, ...anime]
  }
}