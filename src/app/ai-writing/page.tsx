'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Wand2, Copy, Download } from 'lucide-react'
import { AI_PROMPTS } from '@/lib/ai/prompts'

function AIWritingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 原始上下文
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalSummary, setOriginalSummary] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [platform, setPlatform] = useState('')

  // 风格选择（角色风格或基础风格二选一）
  const [selectedStyle, setSelectedStyle] = useState('urbanObserver')
  const [selectedBasicStyle, setSelectedBasicStyle] = useState('')

  // 生成/编辑/搜索
  const [generatedContent, setGeneratedContent] = useState('')
  const [editableContent, setEditableContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState('')

  useEffect(() => {
    setOriginalTitle(searchParams.get('originalTitle') || '')
    setOriginalSummary(searchParams.get('originalSummary') || '')
    setSelectedTopic(searchParams.get('selectedTopic') || '')
    setTopicDescription(searchParams.get('topicDescription') || '')
    setPlatform(searchParams.get('platform') || '')
  }, [searchParams])

  // 先搜后写：用标题拉取近30天摘要
  const searchWithBocha = async () => {
    if (!originalTitle) return
    setIsSearching(true)
    try {
      const res = await fetch('/api/ai/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: originalTitle })
      })
      if (!res.ok) throw new Error('搜索失败')
      const data = await res.json()
      setSearchResults(data.summary || '未找到相关信息')
    } catch (e) {
      console.error(e)
      setSearchResults('搜索失败，将使用原始信息生成文案')
    } finally {
      setIsSearching(false)
    }
  }

  const generateContent = async () => {
    if (!selectedTopic || (!selectedStyle && !selectedBasicStyle)) {
      alert('请确保选题和写作风格都已选择')
      return
    }
    setIsGenerating(true)
    try {
      // 若无搜索结果则先搜索一次
      if (!searchResults && originalTitle) {
        await searchWithBocha()
      }
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTitle,
          originalSummary,
          selectedTopic,
          topicDescription,
          selectedStyle: selectedStyle || selectedBasicStyle,
          platform,
          searchResults
        })
      })
      if (!res.ok) throw new Error('生成文案失败')
      const data = await res.json()
      setGeneratedContent(data.content || '')
      setEditableContent(data.content || '')
    } catch (e) {
      console.error(e)
      alert('生成文案失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyContent = () => {
    navigator.clipboard.writeText(editableContent || generatedContent)
    alert('文案已复制到剪贴板')
  }

  const downloadContent = () => {
    const text = editableContent || generatedContent
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(selectedTopic || '文案').substring(0, 20)}_文案.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <h1 className="text-2xl font-bold text-gray-900">AI写作助手</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* 左侧：选题信息和设置（2列） */}
          <div className="space-y-6 lg:col-span-2">
            {/* 原始热点信息 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">原始热点</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">标题</label>
                  <p className="mt-1 text-gray-900">{originalTitle}</p>
                </div>
                {originalSummary && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">摘要</label>
                    <p className="mt-1 text-gray-600 text-sm">{originalSummary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 选题信息 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">选定选题</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">选题方向</label>
                  <p className="mt-1 text-gray-900 font-medium">{selectedTopic}</p>
                </div>
                {topicDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">选题说明</label>
                    <p className="mt-1 text-gray-600 text-sm leading-relaxed">{topicDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 写作风格选择 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">选择写作风格</h2>

              {/* 角色风格 */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">角色风格</h3>
                <div className="space-y-3">
                  {Object.entries(AI_PROMPTS.styles).map(([key, description]) => {
                    const styleNames: Record<string, string> = {
                      urbanObserver: '都市观察员',
                      filmWorker: '影视民工',
                      surfingExpert: '影视洞察官'
                    }
                    return (
                      <label key={key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="style_role"
                          value={key}
                          checked={selectedStyle === key}
                          onChange={(e) => { setSelectedStyle(e.target.value); setSelectedBasicStyle('') }}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {styleNames[key] || key}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {String(description).split('\n')[0].substring(0, 100)}...
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* 基础风格 */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">基础风格</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(AI_PROMPTS.basicStyles || []).map((style) => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="style_basic"
                        value={style}
                        checked={selectedBasicStyle === style}
                        onChange={(e) => { setSelectedBasicStyle(e.target.value); setSelectedStyle('') }}
                        className="text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 搜索最新信息 */}
              <button
                onClick={searchWithBocha}
                disabled={isSearching || !originalTitle}
                className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {isSearching ? '正在搜索最新信息...' : '搜索最新信息'}
              </button>

              {/* 生成按钮 */}
              <button
                onClick={generateContent}
                disabled={isGenerating || !selectedTopic || (!selectedStyle && !selectedBasicStyle)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? '正在生成文案...' : '生成短视频文案'}
              </button>
            </div>
          </div>

          {/* 右侧：生成的文案（5列） */}
          <div className="bg-white rounded-lg p-6 shadow-sm lg:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">生成的文案</h2>
              {(generatedContent || editableContent) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                  <button
                    onClick={downloadContent}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-96">
              {isGenerating ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Wand2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-gray-600">AI正在创作中，请稍候...</p>
                  </div>
                </div>
              ) : (generatedContent || editableContent) ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full min-h-96 bg-gray-50 rounded-lg p-4 text-gray-900 leading-relaxed outline-none focus:ring-2 focus:ring-purple-500"
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    placeholder="AI 生成内容将出现在这里，可手动编辑后再复制/下载"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>选择写作风格后，点击"生成短视频文案"开始创作</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AIWritingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <AIWritingContent />
    </Suspense>
  )
}