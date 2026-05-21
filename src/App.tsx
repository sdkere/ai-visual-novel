import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { trackPageView } from '@/utils/tracker'
import CategoryList from '@/components/CategoryList'
import StoryList from '@/components/StoryList'
import StoryDetail from '@/components/StoryDetail'
import CharacterCreate from '@/components/CharacterCreate'
import GameScreen from '@/components/GameScreen'

export default function App() {
  const { view, messages, storyId, storyDetail } = useGameStore()

  // If we have saved game data and view is 'game', resume directly
  const hasSavedGame = view === 'game' && messages.length > 0 && storyId

  // Track page view on mount
  useEffect(() => {
    trackPageView()
  }, [])

  // On mount, fix invalid persisted state
  useEffect(() => {
    if (hasSavedGame) {
      useGameStore.setState({ isLoading: false })
    }
    // If view is storyDetail but storyDetail is null (wasn't persisted), reset to categories
    if (view === 'storyDetail' && !storyDetail) {
      useGameStore.setState({ view: 'categories', isLoading: false })
    }
    // If view is game but no storyId, reset
    if (view === 'game' && !storyId) {
      useGameStore.setState({ view: 'categories', isLoading: false })
    }
    // If view is characterCreate but no selectedStoryId, reset
    if (view === 'characterCreate' && !storyId && !useGameStore.getState().selectedStoryId) {
      useGameStore.setState({ view: 'categories', isLoading: false })
    }
  }, [])

  const isGameView = hasSavedGame || view === 'game'

  return (
    <div className={`w-screen bg-[#0a0a0f] ${isGameView ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {view === 'categories' && <CategoryList />}
      {view === 'storyList' && <StoryList />}
      {view === 'storyDetail' && <StoryDetail />}
      {view === 'characterCreate' && <CharacterCreate />}
      {view === 'game' && <GameScreen />}
      {!isGameView && (
        <footer className="w-full py-6 flex items-center justify-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
          <img src="/yundong-logo.svg" alt="云洞科技" className="h-6" />
          <span className="text-xs text-gray-500 tracking-wide">中国云洞科技有限公司出品</span>
        </footer>
      )}
    </div>
  )
}
