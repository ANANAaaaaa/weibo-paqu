import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      originalTitle, 
      originalSummary, 
      selectedTopic, 
      topicDescription,
      selectedStyle,
      platform,
      searchResults 
    } = await request.json()

    if (!originalTitle || !selectedTopic) {
      return NextResponse.json(
        { error: '原标题和选题不能为空' },
        { status: 400 }
      )
    }

    // 导入写作风格预设
    const { AI_PROMPTS } = await import('@/lib/ai/prompts')
    
    // 判断是否为基础风格
    const isBasicStyle = AI_PROMPTS.basicStyles.includes(selectedStyle)
    const stylePrompt = isBasicStyle 
      ? `请采用${selectedStyle}的写作风格` 
      : (AI_PROMPTS.styles[selectedStyle as keyof typeof AI_PROMPTS.styles] || '')

    // 构建提示词
    const prompt = `
${stylePrompt}

现在请基于以下信息创作短视频文案：

【原始热点】
标题：${originalTitle}
摘要：${originalSummary || '无'}

${searchResults ? `【最新搜索信息】
${searchResults}

` : ''}【选题方向】
${selectedTopic}

【选题说明】
${topicDescription || '无'}

【平台】${platform || '通用'}

请严格按照上述人设和风格要求，创作一篇400字左右的短视频口播文案。文案要紧扣选题方向，体现专业洞察，语言生动有趣，适合短视频传播。

${searchResults ? '请结合最新搜索信息，确保内容的准确性和时效性。' : ''}

直接输出完整的口播逐字稿，不需要分段标注。
`

    // 调用AI API生成文案
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('AI API调用失败')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    return NextResponse.json({
      content,
      selectedTopic,
      originalTitle
    })

  } catch (error) {
    console.error('生成文案失败:', error)
    return NextResponse.json(
      { error: '生成文案失败，请稍后重试' },
      { status: 500 }
    )
  }
}