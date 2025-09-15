# 微博爬取应用

一个基于 Next.js 的微博热点和RSS内容聚合平台，集成AI功能进行内容筛选、选题生成和文案写作。

## 功能特性

### 数据源集成
- **RSS微博**: 通过RSSHub获取15位微博大V的最新内容
- **天聚数行**: 获取电竞和动漫资讯
- **榜眼数据**: 获取知乎、微博、抖音等平台的热点榜单

### AI功能
- **内容筛选**: 使用通义千问对RSS内容进行分类筛选（泛娱乐/电竞/二次元/广告/忽略）
- **选题生成**: 基于热点数据生成5个不同角度的短视频选题，支持扩展
- **文案写作**: 使用DeepSeek生成400字口播文案，支持多种风格
- **违禁词检测**: 通义千问检测文案中的违禁词并提供替换建议

### 界面特性
- 瀑布流展示，支持按时间/热度排序
- 响应式设计，支持移动端
- 实时搜索和筛选
- 版本管理（最多保留2个版本）

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI服务**: 通义千问(qwen-flash), DeepSeek(deepseek-chat), 博查搜索
- **数据处理**: axios, xml2js, nodejieba, cheerio
- **UI组件**: Lucide React图标

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.local` 文件并配置API密钥：

```bash
# AI 服务密钥
DEEPSEEK_API_KEY=your_deepseek_key
DASHSCOPE_API_KEY=your_dashscope_key
QWEN_API_KEY=your_qwen_key

# 数据源API密钥
TIANAPI_KEY=your_tianapi_key
BANGYAN_API_KEY=your_bangyan_key
BOCHA_API_KEY=your_bocha_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用流程

### 1. 查看热点内容
- 访问首页查看聚合的热点内容
- 使用筛选器按来源、关键词排序
- 点击"强制刷新"获取最新数据

### 2. RSS内容筛选
- 访问 `/rss` 页面查看微博RSS内容
- 点击"AI筛选"选择内容类别
- AI将筛选出相关内容并显示理由

### 3. AI选题生成
- 访问 `/topics` 页面
- 点击"生成5个选题"基于热点创建选题
- 点击"扩展5个"生成更多不同角度的选题
- 查看选题详情和相关热点

### 4. AI文案写作
- 选择选题后进入写作页面
- 选择写作风格（预设风格或基础标签）
- 点击"生成初稿"创建400字文案
- 使用"违禁词检测"检查并优化内容
- 保存最终稿

## API接口

### 热点数据
- `GET /api/hot-items` - 获取热点数据
- `POST /api/refresh` - 强制刷新数据

### AI功能
- `POST /api/ai/filter` - RSS内容筛选
- `POST /api/topics/generate` - 生成选题
- `POST /api/topics/expand` - 扩展选题
- `POST /api/writing/generate` - 生成文案
- `POST /api/writing/check-violations` - 违禁词检测

## 项目结构

```
src/
├── app/                    # Next.js App Router页面
│   ├── api/               # API路由
│   ├── rss/               # RSS页面
│   ├── topics/            # 选题页面
│   └── writing/           # 写作页面
├── components/            # React组件
├── lib/                   # 工具库
│   ├── ai/               # AI客户端和提示词
│   └── data/             # 数据源服务
└── types/                # TypeScript类型定义
```

## 数据更新机制

- 统一每3小时自动抓取数据
- 24小时去重窗口
- 支持手动强制刷新
- 瀑布流分页，每页60条

## 注意事项

1. 确保所有API密钥配置正确
2. RSS服务依赖RSSHub的稳定性
3. AI服务调用有频率限制
4. 文案版本最多保留2个
5. 违禁词检测需要人工确认

## 开发说明

- 使用TypeScript确保类型安全
- 遵循Next.js 14的App Router规范
- 组件采用客户端渲染('use client')
- API路由处理服务端逻辑
- 响应式设计适配多端设备