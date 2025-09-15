import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 这里可以添加强制刷新逻辑
    // 比如清除缓存、重新获取数据等
    
    return NextResponse.json({ 
      success: true, 
      message: '刷新成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('强制刷新失败:', error)
    return NextResponse.json(
      { error: '刷新失败' },
      { status: 500 }
    )
  }
}