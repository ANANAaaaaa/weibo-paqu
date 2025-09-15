import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 测试环境变量
    const apiKey = process.env.DEEPSEEK_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'DEEPSEEK_API_KEY 环境变量未设置',
        env: Object.keys(process.env).filter(key => key.includes('DEEPSEEK'))
      })
    }

    // 测试简单的AI调用
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
            content: '请简单回复"测试成功"'
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `API调用失败: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'AI API测试成功',
      response: data.choices[0]?.message?.content || '无响应内容'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}