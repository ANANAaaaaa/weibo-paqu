import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, summary, platform } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    // 构建高质量选题提示词
    const prompt = `
任务目标：
作为泛娱乐账号，基于当前热点内容，生成5个视角独立的短视频选题，每个选题从不同维度切入，避免同质化表达，并用3句话清晰说明各选题的方向。

热点内容：
标题：${title}
摘要：${summary || '无'}
平台：${platform || '未知'}

方法论：
激发内容本身的联想与发散能力，再结合短视频平台的内容优化选题表达，确保选题既能从热点自然切入，又形成记忆点与传播势能。选题之间无交叉、不重复，体现思维的广度与深度。

执行步骤：
① 提取热点核心要素，识别热点背后的核心矛盾或情绪张力；
② 生成5个独立选题，确保无视角重叠，且均能从热点自然切入但走向不同纵深；
③ 对每个选题进行"一句话介绍"提炼，再用三句话展开说明。

输出格式：
选题1：[一句话标题]
说明：[第一句话：切入角度] [第二句话：核心观点] [第三句话：传播价值]

选题2：[一句话标题]
说明：[第一句话：切入角度] [第二句话：核心观点] [第三句话：传播价值]

...以此类推，共5个选题
`

    // 检查API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY 环境变量未设置')
      return NextResponse.json(
        { error: 'AI服务配置错误，请联系管理员' },
        { status: 500 }
      )
    }

    console.log('开始调用DeepSeek API...')
    
    // 调用AI API生成选题
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    })

    console.log('DeepSeek API响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API错误:', errorText)
      throw new Error(`AI API调用失败: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    // 解析生成的选题 - 按照新格式处理
    const topicBlocks = content.split(/选题\d+：/).filter((block: string) => block.trim().length > 0)
    const topics: string[] = []
    
    topicBlocks.forEach((block: string, index: number) => {
      if (index === 0 && !block.includes('说明：')) {
        // 跳过可能的前言部分
        return
      }
      
      const lines = block.trim().split('\n').filter((line: string) => line.trim().length > 0)
      if (lines.length > 0) {
        // 重新组装选题格式
        const topicNumber = topics.length + 1
        const fullTopic = `选题${topicNumber}：${block.trim()}`
        topics.push(fullTopic)
      }
    })
    
    // 如果解析失败，尝试简单的行分割
    if (topics.length === 0) {
      const fallbackTopics = content
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && (line.includes('选题') || line.length > 10))
        .slice(0, 5)
      
      topics.push(...fallbackTopics)
    }

    return NextResponse.json({
      topics: topics.slice(0, 5), // 确保只返回5个选题
      originalTitle: title
    })

  } catch (error) {
    console.error('生成选题失败:', error)
    return NextResponse.json(
      { error: '生成选题失败，请稍后重试' },
      { status: 500 }
    )
  }
}