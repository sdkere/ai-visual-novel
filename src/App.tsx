import { useGameStore } from '@/store/gameStore'
import MainMenu from '@/components/MainMenu'
import GameScreen from '@/components/GameScreen'

export default function App() {
  const { worldId } = useGameStore()

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      {worldId ? <GameScreen /> : <MainMenu />}
    </div>
  )
}
