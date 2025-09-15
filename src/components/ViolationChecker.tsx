'use client'

import { useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { ViolationCheck } from '@/types'

interface ViolationCheckerProps {
  content: string
  onContentUpdate: (content: string) => void
}

export default function ViolationChecker({ content, onContentUpdate }: ViolationCheckerProps) {
  const [checking, setChecking] = useState(false)
  const [violations, setViolations] = useState<ViolationCheck | null>(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  const checkViolations = async () => {
    if (!content.trim()) return
    
    setChecking(true)
    try {
      const response = await fetch('/api/writing/check-violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })
      
      const result = await response.json()
      setViolations(result)
      setAppliedSuggestions(new Set())
    } catch (error) {
      console.error('违禁词检测失败:', error)
    } finally {
      setChecking(false)
    }
  }

  const applySuggestion = (target: string, replacement: string) => {
    const newContent = content.replace(target, replacement)
    onContentUpdate(newContent)
    setAppliedSuggestions(prev => {
      const newSet = new Set(prev)
      newSet.add(target)
      return newSet
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case '合规': return 'text-red-600 bg-red-50 border-red-200'
      case '引战': return 'text-orange-600 bg-orange-50 border-orange-200'
      case '夸大': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case '低俗': return 'text-purple-600 bg-purple-50 border-purple-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">违禁词检测</h3>
        <button
          onClick={checkViolations}
          disabled={checking || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          <AlertTriangle className={`w-4 h-4 ${checking ? 'animate-pulse' : ''}`} />
          {checking ? '检测中...' : '检测违禁词'}
        </button>
      </div>

      {violations && (
        <div className="space-y-4">
          {/* 高亮显示问题 */}
          {violations.highlights.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">发现的问题</h4>
              <div className="space-y-2">
                {violations.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className={`inline-block px-2 py-1 rounded text-sm border ${getRiskColor(highlight.risk)}`}
                  >
                    "{highlight.text}" - {highlight.risk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 替换建议 */}
          {violations.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">替换建议</h4>
              <div className="space-y-3">
                {violations.suggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">"{suggestion.target}"</span>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.note}</p>
                      </div>
                      {appliedSuggestions.has(suggestion.target) && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          已应用
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {suggestion.candidates.map((candidate, candidateIndex) => (
                        <button
                          key={candidateIndex}
                          onClick={() => applySuggestion(suggestion.target, candidate)}
                          disabled={appliedSuggestions.has(suggestion.target)}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          替换为: "{candidate}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {violations.highlights.length === 0 && violations.suggestions.length === 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span>未发现违禁词或风险内容</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}