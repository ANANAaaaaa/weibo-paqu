import { HotItem, RSSItem } from '@/types'

// 模拟榜眼数据
export const mockBangyanData: HotItem[] = [
  {
    id: 'mock_bangyan_1',
    title: '某明星新剧开播引发热议',
    summary: '该剧讲述了现代都市生活中的情感纠葛，首播收视率破2',
    link: 'https://example.com/news1',
    pubDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    platform: 'bangyan',
    sourceName: '榜眼·微博·热搜榜',
    score: 892456
  },
  {
    id: 'mock_bangyan_2',
    title: '游戏新版本更新引发玩家讨论',
    summary: '本次更新包含多个英雄平衡性调整和新皮肤上线',
    link: 'https://example.com/news2',
    pubDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45分钟前
    platform: 'bangyan',
    sourceName: '榜眼·知乎·热榜',
    score: 756234
  },
  {
    id: 'mock_bangyan_3',
    title: '短视频平台推出新功能',
    summary: '新功能允许用户创建更长时间的视频内容，最长可达10分钟',
    link: 'https://example.com/news3',
    pubDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1小时前
    platform: 'bangyan',
    sourceName: '榜眼·抖音·热榜',
    score: 634521
  },
  {
    id: 'mock_bangyan_4',
    title: '电竞赛事总决赛今晚开打',
    summary: '两支顶级战队将在今晚争夺年度总冠军，奖金池高达500万',
    link: 'https://example.com/news4',
    pubDate: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5小时前
    platform: 'bangyan',
    sourceName: '榜眼·微博·热搜榜',
    score: 543210
  },
  {
    id: 'mock_bangyan_5',
    title: '新番动画获得高分评价',
    summary: '这部改编自人气漫画的动画在各大平台都获得了9分以上的高评分',
    link: 'https://example.com/news5',
    pubDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2小时前
    platform: 'bangyan',
    sourceName: '榜眼·知乎·热榜',
    score: 432109
  }
]

// 模拟RSS数据
export const mockRSSData: RSSItem[] = [
  {
    id: 'mock_rss_1',
    title: '今天的心情就像天气一样好☀️',
    summary: '阳光明媚的日子总是让人心情愉悦，分享一下今天拍到的美景',
    description: '阳光明媚的日子总是让人心情愉悦，分享一下今天拍到的美景 #好心情 #阳光',
    link: 'https://weibo.com/example1',
    pubDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15分钟前
    platform: 'rss',
    sourceName: 'RSS微博源1'
  },
  {
    id: 'mock_rss_2',
    title: '新剧《都市情缘》今晚首播',
    summary: '期待已久的都市情感剧终于要播出了，男女主角的颜值都很能打',
    description: '期待已久的都市情感剧终于要播出了，男女主角的颜值都很能打 #新剧首播 #都市情缘',
    link: 'https://weibo.com/example2',
    pubDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25分钟前
    platform: 'rss',
    sourceName: 'RSS微博源2'
  },
  {
    id: 'mock_rss_3',
    title: '电竞比赛太精彩了！',
    summary: '刚看完的比赛真的是神仙打架，每一波团战都让人热血沸腾',
    description: '刚看完的比赛真的是神仙打架，每一波团战都让人热血沸腾 #电竞 #精彩比赛',
    link: 'https://weibo.com/example3',
    pubDate: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35分钟前
    platform: 'rss',
    sourceName: 'RSS微博源3'
  },
  {
    id: 'mock_rss_4',
    title: '推荐一部超好看的动漫',
    summary: '最近在追的这部动漫真的太棒了，画风精美剧情紧凑，强烈推荐',
    description: '最近在追的这部动漫真的太棒了，画风精美剧情紧凑，强烈推荐 #动漫推荐 #二次元',
    link: 'https://weibo.com/example4',
    pubDate: new Date(Date.now() - 1000 * 60 * 50).toISOString(), // 50分钟前
    platform: 'rss',
    sourceName: 'RSS微博源4'
  },
  {
    id: 'mock_rss_5',
    title: '某品牌新品发布会直播中',
    summary: '正在看新品发布会的直播，这次的产品设计真的很有创意',
    description: '正在看新品发布会的直播，这次的产品设计真的很有创意 #新品发布 #科技',
    link: 'https://weibo.com/example5',
    pubDate: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 65分钟前
    platform: 'rss',
    sourceName: 'RSS微博源5'
  },
  {
    id: 'mock_rss_6',
    title: '今天的穿搭分享',
    summary: '秋天的第一套穿搭，简约风格配上温暖的色调，你们觉得怎么样',
    description: '秋天的第一套穿搭，简约风格配上温暖的色调，你们觉得怎么样 #穿搭分享 #秋日风格',
    link: 'https://weibo.com/example6',
    pubDate: new Date(Date.now() - 1000 * 60 * 80).toISOString(), // 80分钟前
    platform: 'rss',
    sourceName: 'RSS微博源6'
  }
]