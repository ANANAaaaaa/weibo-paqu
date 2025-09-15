'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RSSItem } from '@/types'

interface RSSStore {
  rssItems: RSSItem[]
  isLoading: boolean
  lastFetchTime: number | null
  setRSSItems: (items: RSSItem[]) => void
  setLoading: (loading: boolean) => void
  clearRSSItems: () => void
  hasData: () => boolean
}

export const useRSSStore = create<RSSStore>()(
  persist(
    (set, get) => ({
      rssItems: [],
      isLoading: false,
      lastFetchTime: null,
      
      setRSSItems: (items: RSSItem[]) => 
        set({ 
          rssItems: items, 
          lastFetchTime: Date.now() 
        }),
      
      setLoading: (loading: boolean) => 
        set({ isLoading: loading }),
      
      clearRSSItems: () => 
        set({ 
          rssItems: [], 
          lastFetchTime: null 
        }),
      
      hasData: () => get().rssItems.length > 0
    }),
    {
      name: 'rss-storage',
      partialize: (state) => ({ 
        rssItems: state.rssItems,
        lastFetchTime: state.lastFetchTime
      })
    }
  )
)