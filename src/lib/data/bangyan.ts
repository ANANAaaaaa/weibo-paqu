import axios from 'axios'
import { HotItem } from '@/types'
import { mockBangyanData } from './mock'

export class BangyanService {
  private apiKey: string
  private baseURL = 'https://api.tophubdata.com'

  constructor() {
    this.apiKey = process.env.BANGYAN_API_KEY || 'd78f0485c09ae6fc5be087c80bf035d6'
  }

  // 固定的三个平台 hashid
  private targets = [
    { hashid: 'KqndgxeLl9', name: '微博', display: '热搜榜' },
    { hashid: 'DpQvNABoNE', name: '抖音', display: '热榜' },
    { hashid: 'mproPpoq6O', name: '知乎', display: '热榜' }
  ] as const

  // 获取单个平台榜单内容（严格按新返回结构解析）
  private async fetchNodeByHashid(hashid: string) {
    const url = `${this.baseURL}/nodes/${hashid}`
    try {
      const res = await axios.get(url, {
        headers: { Authorization: this.apiKey },
        timeout: 15000
      })
      const data = res.data
      if (!data || data.error || !data.data) {
        throw new Error(`接口返回错误: ${JSON.stringify(data)}`)
      }
      const { name, display, items } = data.data || {}
      if (!Array.isArray(items)) {
        throw new Error('items 非数组或缺失')
      }
      return { name: String(name || ''), display: String(display || ''), items }
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 401) console.warn(`[Bangyan] 授权失败 ${hashid}`)
      if (status === 429) console.warn(`[Bangyan] 频率受限 ${hashid}`)
      console.warn(`[Bangyan] 获取失败 ${hashid}:`, e?.message || e)
      return null
    }
  }

  // 转换为 HotItem
  private normalizeItems(hashid: string, name: string, display: string, items: any[]): HotItem[] {
    return items.slice(0, 10).map((it: any, idx: number) => ({
      id: `bangyan_${hashid}_${idx}_${Date.now()}`,
      title: it?.title || '无标题',
      summary: it?.description || '',
      link: it?.url || '',
      pubDate: new Date().toISOString(),
      platform: 'bangyan',
      sourceName: `${name}·${display}`,
      hotValue: it?.extra || '', // 这里保留原始热度字符串（如“455万热度”）
      score: 0
    }))
  }

  // 对外主入口：按平台顺序合并返回（微博→抖音→知乎）
  async fetchAll(): Promise<HotItem[]> {
    const result: HotItem[] = []
    for (const t of this.targets) {
      const data = await this.fetchNodeByHashid(t.hashid)
      if (data && data.items?.length) {
        const items = this.normalizeItems(t.hashid, data.name || t.name, data.display || t.display, data.items)
        result.push(...items)
      } else {
        console.warn(`[Bangyan] 跳过平台 ${t.name}（请求失败或无数据）`)
      }
      // 轻微间隔，避免触发限流
      await new Promise(r => setTimeout(r, 600))
    }

    // 若全部失败，兜底返回 mock，但不改变顺序要求
    if (result.length === 0) {
      console.warn('[Bangyan] 所有平台获取失败，返回模拟数据')
      return mockBangyanData.slice(0, 30)
    }
    return result
  }
}