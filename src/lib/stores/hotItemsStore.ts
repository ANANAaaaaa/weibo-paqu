'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HotItem } from '@/types'

interface HotItemsStore {
  hotItems: HotItem[]
  isLoading: boolean
  lastFetchTime: number
  hasData: boolean
  
  setHotItems: (items: HotItem[]) => void
  setLoading: (loading: boolean) => void
  clearData: () => void
  shouldRefresh: () => boolean
}

export const useHotItemsStore = create<HotItemsStore>()(
  persist(
    (set, get) => ({
      hotItems: [],
      isLoading: false,
      lastFetchTime: 0,
      hasData: false,
      
      setHotItems: (items) => set({ 
        hotItems: items, 
        hasData: items.length > 0,
        lastFetchTime: Date.now()
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      clearData: () => set({ 
        hotItems: [], 
        hasData: false, 
        lastFetchTime: 0 
      }),
      
      shouldRefresh: () => {
        const { lastFetchTime } = get()
        const now = Date.now()
        const thirtyMinutes = 30 * 60 * 1000
        return now - lastFetchTime > thirtyMinutes
      }
    }),
    {
      name: 'hot-items-storage',
      partialize: (state) => ({
        hotItems: state.hotItems,
        lastFetchTime: state.lastFetchTime,
        hasData: state.hasData
      })
    }
  )
)