import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import CategoryList from '@/components/CategoryList'
import StoryList from '@/components/StoryList'
import StoryDetail from '@/components/StoryDetail'
import CharacterCreate from '@/components/CharacterCreate'
import GameScreen from '@/components/GameScreen'

export default function App() {
  const { view, messages, storyId } = useGameStore()

  // If we have saved game data and view is 'game', resume directly
  const hasSavedGame = view === 'game' && messages.length > 0 && storyId

  // On mount, if we have a saved game, skip loading state
  useEffect(() => {
    if (hasSavedGame) {
      useGameStore.setState({ isLoading: false })
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
    </div>
  )
}
